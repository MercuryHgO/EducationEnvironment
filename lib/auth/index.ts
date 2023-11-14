import {sha256} from "js-sha256";
import {verify, sign, JwtPayload, VerifyErrors } from "jsonwebtoken";
import {prisma} from "@/lib/prisma"
import keys from "@/lib/dotenv"

async function deleteExpiredDestroyedTokens() {
	const now = new Date()
	await prisma.destroyedTokens.deleteMany({
		where: {
			ClearAt: {
				lte: now
			}
		}
	})
}

/**
 * Creates new user in database
 *
 * Создает нового пользователя в базе данных
*/
export async function signUp(name: string,password: string, role?: string) {
	
	const query = await prisma.user.create({
		data: {
			name: name,
			password: sha256(password),
			role: {
				connect: {
					name: role ?? 'user'
				}
			}
		}
	})
	
	return 'created new user: ' + query.name
}

/**
 * Generate new tokens using Name and Password of the user
 *
 * Генерирует новые токены Access и Refresh на основе Имени и Пароля пользователя
 */
export async function generateTokens(name: string, password: string) {
	const query = await prisma.user.findUnique({
		where: {
			name: name,
			password: sha256(password)
		},
		// include: {
		// 	role: true
		// }
	})
	
	if(query) {
		const { id } = query;
		const accessToken = sign(
			{
				id: id,
			},
			keys.JWT_ACCESS_KEY,
			{
				expiresIn: '15m',
			}
		)
		
		const refreshToken = sign(
			{
				id: id,
				accessToken: accessToken
			},
			keys.JWT_REFRESH_KEY!,
			{
				expiresIn: '1d',
			}
		)
		
		return {
			refresh: refreshToken,
			access: accessToken
		}
	}
}

/**
 * Authorizes user using Access token
 *
 * Авторизирует пользователя на основе Access токена
 */
export async function signIn(accessToken: string){
	let decodedInfo: string | JwtPayload | undefined
	
	verify(accessToken,keys.JWT_ACCESS_KEY!,(error: VerifyErrors | null, decoded: any) => {
		if (error) {
			// console.log(error)
			return null;
		}
		decodedInfo = decoded
	})
	
	if(!!decodedInfo){
		return decodedInfo as {
			id: string
		}
	}
}

/**
 * Updates both tokens using Refresh
 *
 * Обновляет оба токена на основе Refresh
 */
export async function updateTokens(refreshToken: string){
	
	let access: string | undefined
	let refresh: string | undefined
	
	verify(refreshToken,keys.JWT_REFRESH_KEY!,async (error: VerifyErrors | null, decoded: any) => {
		if (error) return;
		
		const {id, accessToken} = decoded as { id: string, accessToken: string };
		
		await deleteExpiredDestroyedTokens()
		
		const now = new Date()
		await prisma.destroyedTokens.createMany({
			data: [
				{
					Token: accessToken,
					ClearAt: new Date(now.getTime() + 15 * 60 * 1000)
					
				},
				{
					Token: refreshToken,
					ClearAt: new Date(now.getTime() + 60 * 60 * 1000)
				}
				],
		})
		
		const newAccessToken = sign(
			{
				id: id
			},
			keys.JWT_ACCESS_KEY!,
			{
				expiresIn: '15m'
			}
		)
		
		const newRefreshToken = sign(
			{
				id: id,
				accessToken: newAccessToken
			},
			keys.JWT_REFRESH_KEY!,
			{
				expiresIn: '1h'
			}
		)
		
		access = newAccessToken
		refresh = newRefreshToken
	})
	
	if(!!access && !!refresh){
		return {
			access,
			refresh
		}
	}
	
	return null
}