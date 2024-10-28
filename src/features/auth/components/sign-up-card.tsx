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
    const { signIn } = useAuthActions();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const [isVisible, setIsVisible] = useState(false);
    const [isVisibleCnf, setIsVisibleCnf] = useState(false);

    const onPassSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setPending(true);
        try {
            await signIn("password", { name, email, password, flow: "signUp" });
            setPending(false);
        } catch (error) {
            setError("Invalid email or password");
        }
        finally { setPending(false) };
    };

    const onProviderSignUp = (value: "github" | "google") => {
        setPending(true);
        try {
            signIn(value)
                .finally(() => setPending(false));
        } catch (error) {
            console.error(error);
        }

    };

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Signup to continue</CardTitle>
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
                <form className="space-y-2.5" onSubmit={onPassSignUp}>
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
                                className="absolute right-2.5 top-2.5 cursor-pointer"
                                onClick={() => setIsVisibleCnf(!isVisibleCnf)}
                            />
                        ) : (
                            <EyeOffIcon
                                className="absolute right-2.5 top-2.5 cursor-pointer"
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
                        onClick={() => onProviderSignUp("google")}
                        variant="outline"
                        size="lg"
                        className="w-full relative"
                    >
                        <FcGoogle className="size-5 absolute top-2.5 left-2.5" />
                        Continue with Google
                    </Button>
                    <Button
                        disabled={pending}
                        onClick={() => onProviderSignUp("github")}
                        variant="outline"
                        size="lg"
                        className="w-full relative"
                    >
                        <FaGithub className="size-5 absolute top-2.5 left-2.5" />
                        Continue with Github
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Already have an account?  <span onClick={() => setState("signIn")} className="text-sky-700 hover:underline cursor-pointer">
                        Sign In
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};