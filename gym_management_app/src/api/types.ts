export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: string;
  is_active: boolean;
}

export interface Membership {
  id: number;
  member_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'canceled' | 'expired';
  canceled_at: string | null;
}

export interface MemberSummary {
  member: Member;
  active_membership: {
    membership_id: number;
    start_date: string;
    end_date: string;
    plan_id: number;
    plan_name: string;
    plan_price: string;
  } | null;
  last_check_in_time: string | null;
  check_ins_last_30_days: number;
}