import { useRouter } from "next/router";
import { Button, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { User } from "@supabase/supabase-js";
import apiClient, { processAxiosError } from "../lib/apiClient";

export default function Register() {
  const router = useRouter();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: any) => {
    try {
      const response = await apiClient.post<{ user?: User }>(
        "/api/register",
        data
      );

      const { user } = response.data;

      if (user !== undefined) {
        router.push(`/welcome?email${user.email}`);
      }
    } catch (error) {
      processAxiosError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="email"
        placeholder="이메일"
        autoComplete="email"
        {...register("email")}
      />
      <Input
        type="password"
        placeholder="비밀번호"
        autoComplete="new-password"
        {...register("password")}
      />
      <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
