import { TrendingUp, Volume2, Flame } from "lucide-react";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

const TrendingTables = () => {
  const { data: votedTokens, isLoading: loadingVoted } = useTrendingByVotes();
  const { data: volumeTokens, isLoading: loadingVolume } = useTopByVolume();
  const { data: gainTokens, isLoading: loadingGain } = useTopByPriceGain();
  const [voteCountsMap, setVoteCountsMap] = React.useState<Record<string, number>>({});

  const topVoted = votedTokens?.slice(0, 3) || [];
  const topVolume = volumeTokens || [];
  const topGain = gainTokens || [];

  // Fetch vote counts for trending tokens
  React.useEffect(() => {
    const fetchVoteCounts = async () => {
      if (!topVoted.length) return;
      
      const addresses = topVoted.map(t => t.baseToken.address);
      const { data } = await supabase
        .from('token_vote_counts')
        .select('token_address, vote_count')
        .in('token_address', addresses);
      
      if (data) {
        const map: Record<string, number> = {};
        data.forEach(item => {
          map[item.token_address.toLowerCase()] = item.vote_count;
        });
        setVoteCountsMap(map);
      }
    };
    
    fetchVoteCounts();
  }, [topVoted]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Trending by Votes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Trending by Votes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingVoted ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topVoted.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topVoted.map((token) => {
              const voteCount = voteCountsMap[token.baseToken.address.toLowerCase()] || 0;
              return (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{voteCount} votes</span>
                  <span className={`text-sm ${token.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24.toFixed(1)}%
                  </span>
                </div>
              </Link>
            );
            })
          )}
        </CardContent>
      </Card>

      {/* Trending by Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-accent" />
            Trending by trading volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingVolume ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topVolume.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topVolume.map((token) => (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <span className={`text-sm ${token.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24.toFixed(1)}%
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Trending by Price Gain */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Biggest Gainers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingGain ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topGain.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topGain.map((token) => (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <span className="text-sm text-green-500">
                  +{token.priceChange.h24.toFixed(1)}%
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingTables;
