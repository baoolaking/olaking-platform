import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Services Page</h1>
        <p className="text-muted-foreground mb-8">Coming soon...</p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
