import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";

import { EyeIcon, EyeOffIcon, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SignInFlow } from "../types";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignInCardProps {
    setState: (state: SignInFlow) => void;
};

export const SignInCard = ({ setState }: SignInCardProps) => {
    // const { signIn } = useAuthActions();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const [isVisible, setIsVisible] = useState(false);

    // const onPassSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     setPending(true);
    //     try {
    //         await signIn("password", { email, password, flow: "signIn" });
    //         setPending(false);
    //     } catch (error) {
    //         setError("Invalid email or password");
    //     }
    //     finally { setPending(false) };
    // };

    // const onProviderSignIn = (value: "github" | "google") => {
    //     setPending(true);
    //     try {
    //         signIn(value)
    //             .finally(() => setPending(false));
    //     } catch (error) {
    //         console.error(error);
    //     }

    // };

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Login to continue</CardTitle>
                <CardDescription>
                    Use your email or another service to continue
                </CardDescription>
            </CardHeader>
            {!!error &&
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlert className="size-4" />
                    <span>{error}</span>
                </div>
            }
            <CardContent className="space-y-5 px-0 pb-0">
                <form className="space-y-2.5" >
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required />
                    <div className="relative">
                        <Input
                            disabled={pending}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            type={isVisible ? 'text' : 'password'}
                            required />
                        {!isVisible ? (
                            <EyeIcon
                                className="absolute right-2.5 top-2.5 cursor-pointer"
                                onClick={() => setIsVisible(!isVisible)}
                            />
                        ) : (
                            <EyeOffIcon
                                className="absolute right-2.5 top-2.5 cursor-pointer"
                                onClick={() => setIsVisible(!isVisible)}
                            />
                        )}
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={pending}>
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">
                    <Button
                        disabled={pending}
                        onClick={() => {}}
                        variant="outline"
                        size="lg"
                        className="w-full relative"
                    >
                        <FcGoogle className="size-5 absolute top-2.5 left-2.5" />
                        Continue with Google
                    </Button>
                    <Button
                        disabled={pending}
                        onClick={() => {}}
                        variant="outline"
                        size="lg"
                        className="w-full relative"
                    >
                        <FaGithub className="size-5 absolute top-2.5 left-2.5" />
                        Continue with Github
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Don&apos;t have an account?  <span onClick={() => setState("signUp")} className="text-sky-700 hover:underline cursor-pointer">
                        Sign up
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};