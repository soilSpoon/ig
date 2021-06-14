import { useForm } from "react-hook-form";
import { Button, Input } from "@chakra-ui/react";
import { supabase } from "../utils/supabaseClient";
import apiClient from "../lib/apiClient";

const onSubmit = async ({ email }: any) => {
  try {
    await apiClient.post("/api/login", { email });
  } catch (error) {
    alert(error.error_description || error.message);
  }
};

const Login = () => {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input placeholder="email" autoComplete="이메일" {...register("email")} />
      <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
        로그인
      </Button>
    </form>
  );
};

export default Login;
