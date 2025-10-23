import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTokenVotes = (tokenAddress: string) => {
  const [voteCount, setVoteCount] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get voter identifier (could be IP or session ID)
  const getVoterIdentifier = () => {
    let voterId = localStorage.getItem('voter_id');
    if (!voterId) {
      voterId = `voter_${Math.random().toString(36).substring(7)}_${Date.now()}`;
      localStorage.setItem('voter_id', voterId);
    }
    return voterId;
  };

  const fetchVoteCount = async () => {
    try {
      // Normalize address to lowercase
      const normalizedAddress = tokenAddress.toLowerCase();
      
      // First try to get from materialized view
      const { data, error } = await supabase
        .from('token_vote_counts')
        .select('vote_count')
        .eq('token_address', normalizedAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vote count:', error);
      }
      
      // If no data in materialized view, count directly from token_votes
      if (!data) {
        const { count, error: countError } = await supabase
          .from('token_votes')
          .select('*', { count: 'exact', head: true })
          .eq('token_address', normalizedAddress);
        
        if (countError) {
          console.error('Error counting votes:', countError);
          setVoteCount(0);
        } else {
          setVoteCount(count || 0);
        }
      } else {
        setVoteCount(data.vote_count || 0);
      }
    } catch (error) {
      console.error('Error fetching vote count:', error);
      setVoteCount(0);
    }
  };

  const checkHasVoted = async () => {
    try {
      const voterId = getVoterIdentifier();
      const normalizedAddress = tokenAddress.toLowerCase();
      
      const { data, error } = await supabase
        .from('token_votes')
        .select('id')
        .eq('token_address', normalizedAddress)
        .eq('voter_ip', voterId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setHasVoted(!!data);
    } catch (error) {
      console.error('Error checking vote status:', error);
      setHasVoted(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoteCount();
    checkHasVoted();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('token-votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_votes',
          filter: `token_address=eq.${tokenAddress.toLowerCase()}`
        },
        () => {
          fetchVoteCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenAddress]);

  const vote = async (captchaValid: boolean) => {
    if (!captchaValid) {
      throw new Error('Please complete the captcha');
    }

    if (hasVoted) {
      throw new Error('You have already voted for this token');
    }

    try {
      const voterId = getVoterIdentifier();
      const normalizedAddress = tokenAddress.toLowerCase();
      
      // Insert vote with lowercase address for consistency
      const { error } = await supabase
        .from('token_votes')
        .insert({
          token_address: normalizedAddress,
          voter_ip: voterId
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already voted for this token');
        }
        throw error;
      }
      
      setHasVoted(true);
      
      // Wait a moment for the trigger to refresh the materialized view
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch updated count
      await fetchVoteCount();
    } catch (error: any) {
      throw error;
    }
  };

  return { voteCount, hasVoted, isLoading, vote };
};
