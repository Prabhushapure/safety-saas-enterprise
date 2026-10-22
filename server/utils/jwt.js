import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'dev-enterprise-jwt-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

export function signAuthToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function buildAuthPayload(user) {
  if (user.role === 'employee' || user.subjectType === 'user') {
    return {
      sub: String(user.id),
      subjectType: 'user',
      role: 'employee',
      company_id: user.company_id ?? null,
      business_partner_id: user.business_partner_id ?? null,
      account_type: 'enterprise',
      slug: user.company_slug || null
    };
  }

  return {
    sub: String(user.id),
    subjectType: 'business_partner',
    role: user.role || 'partner',
    company_id: user.company_id ?? null,
    business_partner_id: user.id,
    account_type: user.account_type || 'partner',
    slug: user.company_slug || null
  };
}

export function toPublicProfile(user, token) {
  if (user.role === 'employee' || user.subjectType === 'user') {
    return {
      id: user.id,
      firstName: user.name || user.first_name,
      email: user.email_id || user.email,
      companyId: user.company_id,
      companyName: user.company_name,
      companySlug: user.company_slug,
      accountType: 'enterprise',
      role: 'employee',
      ...(token ? { token } : {})
    };
  }

  return {
    id: user.id,
    businessPartnerId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.login_id,
    companyId: user.company_id,
    companyName: user.company_name,
    companySlug: user.company_slug,
    accountType: user.account_type || 'partner',
    role: user.role || 'partner',
    country: user.country,
    subscription_plan_id: user.subscription_plan_id,
    ...(token ? { token } : {})
  };
}
