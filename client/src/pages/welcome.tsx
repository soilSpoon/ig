import { Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Welcome() {
  const router = useRouter();
  const { email } = router.query;
  return (
    <Text>
      회원가입해주셔서 감사합니다. 이메일을({email}) 인증을 진행해주세요.
    </Text>
  );
}
