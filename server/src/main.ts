import { loadEnvConfig } from "@next/env";
import {
  IgApiClient,
  MediaInfoResponseCandidatesItem,
  MediaInfoResponseImage_versions2,
} from "instagram-private-api";
import { FbnsNotification, IgApiClientExt, withFbns } from "instagram_mqtt";
import winston from "winston";
import type { BaseEncodingOptions } from "fs";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import readline from 'readline';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/ig.log" }),
    new winston.transports.File({ level: 'warning', filename: "logs/warning.log" }),
    new winston.transports.File({ level: 'error', filename: "logs/error.log" }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const options: BaseEncodingOptions = { encoding: "utf8" };
const STATE_FILE_NAME = "cache/state.json";

const username = process.env.IG_USERNAME as string;
const password = process.env.IG_PASSWORD as string;

(async () => {
  const ig = withFbns(new IgApiClient() as any);

  // this will set the auth and the cookies for instagram
  await readState(ig);

  ig.state.language = "ko_KR";
  ig.state.generateDevice(username);

  // this logs the client in
  ig.request.end$.subscribe(() => saveState(ig));

  try {
    await ig.account.currentUser();
  } catch (error) {
    await ig.account.login(username, password);
  }

  ig.fbns.on("post", async (notification) => {
    if (notification.actionParams === undefined) {
      logEvent("postError")(notification);
      return;
    }

    const mediaId = notification.actionParams.id;
    const media = await ig.media.info(mediaId);

    try {
      const result = media.items.map((item) => {
        if (item.media_type === 8) {
          return ((item as any).carousel_media as any[]).map(itemToData);
        } else if (item.media_type === 1) {
          return itemToData(item);
        } else {
          return item;
        }
      });

      logEvent("post")(result);
    } catch (error) {
      logEvent("postError")({ notification, error });
    }
  });

  ig.fbns.on("subscribed_reel_post", async (notification) => {
    if (notification.actionParams === undefined) {
      const log = logEvent("subscribed_reel_post_error");
      log(notification);
      return;
    }

    const log = logEvent("subscribed_reel_post");
    const { username: targetUsername, launch_reel } = (
      notification as FbnsNotification<{
        username: string;
        launch_reel: string;
      }>
    ).actionParams!;

    const targetUser = await ig.user.searchExact(targetUsername);
    const reelsFeed = ig.feed.reelsMedia({
      userIds: [targetUser.pk],
    });
    const storyItems = await reelsFeed.items();

    log(storyItems[Number(launch_reel)]);
    try {
      log(itemToData(storyItems[Number(launch_reel)]));
    } catch (error) {}
  });

  // you received a notification
  ig.fbns.on("push", (notificatioin) => {
    const { collapseKey } = notificatioin;

    if (
      collapseKey !== undefined &&
      !["post", "subscribed_reel_post"].includes(collapseKey)
    ) {
      logEvent("push")(notificatioin);
    }
  });

  // the client received auth data
  // the listener has to be added before connecting
  ig.fbns.on("auth", () => saveState(ig));

  // 'error' is emitted whenever the client experiences a fatal error
  ig.fbns.on("error", logEvent("error", 'error'));
  // 'warning' is emitted whenever the client errors but the connection isn't affected
  ig.fbns.on("warning", logEvent("warning", 'warn'));

  await ig.fbns.connect();

  logEvent("connected")();

  process.on("SIGINT", async () => {
    clearLine();
    await ig.fbns.disconnect();
    ig.destroy();
    logEvent("disconnected")();
    process.exit();
  });
})();

function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}

function itemToData({
  image_versions2,
  video_versions,
}: {
  image_versions2?: MediaInfoResponseImage_versions2;
  video_versions?: MediaInfoResponseCandidatesItem[];
}) {
  return {
    image: image_versions2?.candidates[0].url,
    video: video_versions?.[0]?.url,
  };
}

async function saveState(ig: IgApiClientExt) {
  try {
    mkdirSync('cache');
  } catch (error) { }
  
  return writeFileSync(STATE_FILE_NAME, await ig.exportState(), {...options, });
}

async function readState(ig: IgApiClientExt) {
  try {
    const state = readFileSync(STATE_FILE_NAME, options) as string;

    await ig.importState(state);

    return true;
  } catch (error) {
    return false;
  }
}

function logEvent(name: string, type: 'info' | 'warn' | 'error' = 'info') {
  return (...data: any) => {
    logger[type](name, ...data);
  };
}
