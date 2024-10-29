import { Navbar } from "@/components/navbar";

interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
};

const WorkspaceLayout = ({ children }: WorkspaceIdLayoutProps) => {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

export default WorkspaceLayout;