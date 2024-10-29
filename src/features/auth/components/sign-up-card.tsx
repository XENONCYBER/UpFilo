import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { EyeIcon, EyeOffIcon, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SignInFlow } from "../types";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignUpCardProps {
    setState: (state: SignInFlow) => void;
};

export const SignUpCard = ({ setState }: SignUpCardProps) => {
    // const { signIn } = useAuthActions();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleCnf, setIsVisibleCnf] = useState(false);

    // const onPassSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     if (password !== confirmPassword) {
    //         setError("Passwords do not match");
    //         return;
    //     }

    //     setPending(true);
    //     try {
    //         await signIn("password", { name, email, password, flow: "signUp" });
    //         setPending(false);
    //     } catch (error) {
    //         setError("Invalid email or password");
    //     }
    //     finally { setPending(false) };
    // };

    // const onProviderSignUp = (value: "github" | "google") => {
    //     setPending(true);
    //     try {
    //         signIn(value)
    //             .finally(() => setPending(false));
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    return (
        <Card className="w-full max-w-md mx-auto p-8">
            <CardHeader className="px-0 pt-0">
            <CardTitle>Signup to continue</CardTitle>
            <CardDescription>
                Use your email or another service to continue
            </CardDescription>
            </CardHeader>
            {!!error &&
            <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600 mb-6">
                <TriangleAlert className="w-4 h-4" />
                <span>{error}</span>
            </div>
            }
            <CardContent className="space-y-5 px-0 pb-0">
            <form className="space-y-2.5">
                <Input
                disabled={pending}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required />
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
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5"
                    onClick={() => setIsVisible(!isVisible)}
                    />
                ) : (
                    <EyeOffIcon
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5"
                    onClick={() => setIsVisible(!isVisible)}
                    />
                )}
                </div>
                <div className="relative">
                <Input
                    disabled={pending}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    type={isVisibleCnf ? 'text' : 'password'}
                    required />
                {!isVisibleCnf ? (
                    <EyeIcon
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5"
                    onClick={() => setIsVisibleCnf(!isVisibleCnf)}
                    />
                ) : (
                    <EyeOffIcon
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5"
                    onClick={() => setIsVisibleCnf(!isVisibleCnf)}
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
                <FcGoogle className="w-5 h-5 absolute top-1/2 left-2.5 transform -translate-y-1/2" />
                Continue with Google
                </Button>
                <Button
                disabled={pending}
                onClick={() => {}}
                variant="outline"
                size="lg"
                className="w-full relative"
                >
                <FaGithub className="w-5 h-5 absolute top-1/2 left-2.5 transform -translate-y-1/2" />
                Continue with Github
                </Button>
            </div>
            <p className="text-xs text-gray-500">
                Already have an account? <span onClick={() => setState("signIn")} className="text-blue-600 hover:underline cursor-pointer">
                Sign In
                </span>
            </p>
            </CardContent>
        </Card>
    );
};