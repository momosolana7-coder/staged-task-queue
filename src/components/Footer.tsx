const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold">G</span>
            </div>
            <div>
              <div className="font-bold text-lg">GIGACOCK</div>
              <div className="text-sm text-muted-foreground">#1 Platform to discover newest tokens</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#dyor" className="text-muted-foreground hover:text-primary transition-colors">DYOR</a>
            <a href="#disclaimer" className="text-muted-foreground hover:text-primary transition-colors">Disclaimer</a>
            <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</a>
            <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
