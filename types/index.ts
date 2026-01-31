// ============================================
// User & Authentication Types
// ============================================

export interface User {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: 'admin' | 'support_agent' | 'super_admin';
    is_active: boolean;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// ============================================
// Master Data Types
// ============================================

export interface Species {
    species_id: number;
    species_code: string;
    species_name: string;
    icon_url?: string;
    is_active: boolean;
    created_at: string;
}

export interface LifeStage {
    life_stage_id: number;
    species_id: number;
    life_stage_code: string;
    life_stage_name: string;
    min_age_months: number;
    max_age_months: number | null;
    description?: string;
    is_active: boolean;
    species_name?: string;
}

export interface SubscriptionTier {
    tier_id: number;
    tier_code: string;
    tier_name: string;
    tier_description?: string;
    marketing_tagline?: string;
    base_price: number;
    display_order: number;
    icon_url?: string;
    color_hex?: string;
    is_active: boolean;
}

export interface ServiceCategory {
    category_id: number;
    category_code: string;
    category_name: string;
    description?: string;
    icon_url?: string;
    display_order: number;
    is_active: boolean;
}

export interface BookingStatus {
    status_id: number;
    status_code: string;
    status_name: string;
    status_type?: string;
    display_color?: string;
    allow_cancellation: boolean;
    allow_reschedule: boolean;
    is_active: boolean;
}

export interface LocationType {
    location_type_id: number;
    type_code: string;
    type_name: string;
    description?: string;
    is_active: boolean;
}

export interface UserRole {
    role_id: number;
    role_code: string;
    role_name: string;
    permissions: Record<string, any>;
    is_active: boolean;
}

// ============================================
// Service Types
// ============================================

export interface Service {
    service_id: string;
    category_id: number;
    category_name?: string;
    category_icon?: string;
    service_name: string;
    description?: string;
    detailed_description?: string;
    base_price: number;
    duration_minutes: number;
    is_doorstep: boolean;
    requires_equipment: boolean;
    equipment_list?: string[];
    preparation_instructions?: string;
    terms_conditions?: string;
    icon_url?: string;
    banner_image_url?: string;
    video_url?: string;
    is_active: boolean;
    popularity_score: number;
    created_at: string;
    updated_at: string;
}

export interface ServiceEligibility {
    eligibility_id: string;
    service_id: string;
    species_id: number;
    life_stage_id: number;
    tier_id: number | null;
    is_included: boolean;
    price_override?: number;
    discount_percentage?: number;
    prerequisites?: string;
    restrictions?: string;
    // Joined fields
    species_name?: string;
    life_stage_name?: string;
    tier_name?: string;
}

export interface ServiceAvailability {
    availability_id: string;
    service_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    max_bookings_per_slot: number;
    buffer_time_minutes: number;
    is_active: boolean;
}

export interface ServiceBlackoutDate {
    blackout_id: string;
    service_id: string;
    blackout_date: string;
    reason?: string;
    is_active: boolean;
}

// ============================================
// Caregiver Types
// ============================================

export interface Caregiver {
    caregiver_id: string;
    user_id: string;
    full_name: string;
    phone: string;
    email: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    experience_years?: number;
    education?: string;
    certifications?: any[];
    languages_spoken?: string[];
    service_area_pincodes?: string[];
    bank_account_number?: string;
    ifsc_code?: string;
    pan_number?: string;
    aadhar_number?: string;
    status: 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';
    background_check_status?: string;
    onboarding_completed: boolean;
    created_at: string;
}

// ============================================
// Booking Types
// ============================================

export interface Booking {
    booking_id: string;
    booking_number: string;
    user_id: string;
    pet_id: string;
    service_id: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
    total_amount: number;
    caregiver_id?: string;
    location_type?: string;
    created_at: string;
}

// ============================================
// Payment Types
// ============================================

export interface Invoice {
    invoice_id: string;
    invoice_number: string;
    user_id: string;
    invoice_type: 'subscription' | 'service' | 'addon';
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    due_date: string;
    created_at: string;
}

// ============================================
// Promo Code Types
// ============================================

export interface PromoCode {
    promo_id: string;
    promo_code: string;
    promo_name: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    max_discount_amount?: number;
    min_purchase_amount?: number;
    applicable_to: 'subscription' | 'service' | 'all';
    tier_ids?: number[];
    service_ids?: string[];
    max_uses_total?: number;
    max_uses_per_user: number;
    current_uses: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface MetricTrend {
    date: string;
    value: number;
    breakdown?: Record<string, any>;
}

export interface DashboardMetrics {
    period: {
        start_date: string;
        end_date: string;
    };
    summary: {
        total_revenue: string;
        avg_active_subscriptions: number;
        total_bookings: number;
        total_users: number;
        new_users: number;
    };
    trends: {
        revenue: MetricTrend[];
        subscriptions: MetricTrend[];
        bookings: MetricTrend[];
    };
}

export interface SubscriptionMetric {
    tier_id: number;
    tier_name: string;
    total_subscriptions: number;
    active: number;
    paused: number;
    cancelled: number;
    avg_price: number;
}

export interface RevenueBreakdown {
    invoice_type: string;
    transaction_count: number;
    total_amount: number;
    avg_amount: number;
}

export interface CaregiverPerformance {
    caregiver_id: string;
    full_name: string;
    average_rating: number;
    total_assignments: number;
    completed_assignments: number;
    total_earnings: number;
    avg_service_time: number;
}

// ============================================
// Table & Pagination Types
// ============================================

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}
