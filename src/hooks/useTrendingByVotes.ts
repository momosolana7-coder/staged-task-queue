import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TokenInfo {
  imageUrl?: string;
  websites?: { url: string }[];
  socials?: { type: string; url: string }[];
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
  };
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: TokenInfo;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

export const useTrendingByVotes = () => {
  return useQuery({
    queryKey: ['trending-by-votes'],
    queryFn: async () => {
      // Get submitted tokens first
      const { data: submittedTokens, error: submittedError } = await supabase
        .from('submitted_tokens')
        .select('token_address');

      if (submittedError) throw submittedError;
      if (!submittedTokens || submittedTokens.length === 0) return [];

      const submittedAddresses = submittedTokens.map(t => t.token_address.toLowerCase());

      // Get top voted tokens with at least 1 vote
      const { data: voteCounts, error } = await supabase
        .from('token_vote_counts')
        .select('token_address, vote_count')
        .gt('vote_count', 0)
        .order('vote_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!voteCounts || voteCounts.length === 0) return [];

      // Filter to only include submitted tokens
      const filteredVotes = voteCounts.filter(v => 
        submittedAddresses.includes(v.token_address.toLowerCase())
      ).slice(0, 20);

      if (filteredVotes.length === 0) return [];

      // Get token addresses
      const tokenAddresses = filteredVotes.map(v => v.token_address);

      // Fetch token data from Dexscreener
      const tokenDataPromises = tokenAddresses.map(async (address) => {
        try {
          const response = await fetch(`${DEXSCREENER_API}/tokens/${address}`);
          if (!response.ok) return null;
          const data = await response.json();
          
          // Get the best pair for this token (highest liquidity on PulseChain)
          const pulsechainPairs = (data.pairs || []).filter(
            (pair: DexPair) => pair.chainId === 'pulsechain'
          );
          
          if (pulsechainPairs.length === 0) return null;
          
          const bestPair = pulsechainPairs.sort((a: DexPair, b: DexPair) => 
            (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
          )[0];
          
          return bestPair;
        } catch (error) {
          console.error(`Error fetching token ${address}:`, error);
          return null;
        }
      });

      const tokenData = await Promise.all(tokenDataPromises);
      
      // Filter out nulls and return valid pairs
      const validPairs = tokenData.filter((pair): pair is DexPair => pair !== null);
      
      return validPairs;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
