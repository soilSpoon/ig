import { loadEnvConfig } from "@next/env";
import {
  IgApiClient,
  MediaInfoResponseCandidatesItem,
  MediaInfoResponseImage_versions2,
} from "instagram-private-api";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const username = process.env.IG_USERNAME as string;
const password = process.env.IG_PASSWORD as string;

(async () => {
  const ig = new IgApiClient();

  ig.state.language = "ko_KR";
  ig.state.generateDevice(username);

  try {
    await ig.account.currentUser();
  } catch (error) {
    await ig.account.login(username, password);
  }

  const targetUser = await ig.user.searchExact("fromshee");
  const reelsFeed = ig.feed.reelsMedia({
    userIds: [targetUser.pk],
  });
  const storyItems = await reelsFeed.items();

  console.log(storyItems.map(itemToData));
})();

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
