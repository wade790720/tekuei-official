import { adminLogin } from '../../../src/lib/adminAuth.ts'
import type { ApiContext } from '../../env.d.ts'

export const onRequestPost = ({ request, env }: ApiContext) => adminLogin(request, env)
