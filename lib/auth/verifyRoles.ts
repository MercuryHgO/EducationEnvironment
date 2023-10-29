import {prisma} from "@/lib/prisma";
import {Prisma} from ".prisma/client";
import RoleWhereInput = Prisma.RoleWhereInput;

/**
 * Checks if user have any of required roles / Проверяет имеет ли пользователь хотя бы одну из требуемых ролей
 */
export async function verifyRoles(id: string,roles: string[]) {
	const rolesInput: RoleWhereInput[] = roles.map((role) => ({name: role}))
	
	const res = await prisma.user.findUnique({
		where: {
			id: id,
			role: {
				OR: rolesInput
			}
		}
	})
	
	if(!res) throw new Error('NO_REQUIRED_ROLE',{cause: 'User dont have required roles'})
}