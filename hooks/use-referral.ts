import { useQuery } from '@tanstack/react-query';
import { referralAPI } from '@/lib/api/referral';

export const useReferralStats = () => {
    return useQuery({
        queryKey: ['referral-stats'],
        queryFn: () => referralAPI.getStats()
    });
};

export const useAllReferrals = (filters: any = {}) => {
    return useQuery({
        queryKey: ['all-referrals', filters],
        queryFn: () => referralAPI.getAll(filters)
    });
};

export const useMyReferralInfo = () => {
    return useQuery({
        queryKey: ['my-referral-info'],
        queryFn: () => referralAPI.getMyInfo()
    });
};
