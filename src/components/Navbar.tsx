import { Search, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link } from "react-router-dom";
import projectLogo from "@/assets/project-logo.png";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={projectLogo} 
                alt="GIGACOCK Logo"
                className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20"
              />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">GIGACOCK</span>
            </Link>
            
            <div className="hidden md:flex relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tokens..." 
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/new-listings" className="text-foreground hover:text-primary transition-colors">
              New Listings
            </Link>
            <Link to="/add-coin" className="text-foreground hover:text-accent transition-colors">
              Add Coin
            </Link>
            <a href="#advertise" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Advertise ✨
            </a>
            {isConnected ? (
              <Button 
                onClick={() => disconnect()}
                className="bg-gradient-accent hover:opacity-90 shadow-lg shadow-accent/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
