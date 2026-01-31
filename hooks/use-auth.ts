'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/auth';
import type { LoginCredentials, User } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Get current user
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: authAPI.getProfile,
        enabled: typeof window !== 'undefined' && !!localStorage.getItem('admin_token'),
        retry: false,
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
        onSuccess: (data) => {
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            queryClient.setQueryData(['auth', 'user'], data.user);
            toast.success('Login successful!');
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Login failed');
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            queryClient.clear();
            toast.success('Logged out successfully');
            router.push('/login');
        },
    });

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
    };
}
