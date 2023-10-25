// import {NextResponse} from "next/server";
import {signIn} from "@/lib/auth/index";
import {NextRequest, NextResponse} from "next/server";

/**
 * Authorizes user with Access token using request object - it finds Access header in the request and returns NextResponse.json object if something goes wrong
 *
 * Авторизирует пользователя с помощью Access токена используя объект Request - ищет заголовок Access в предоставленном запросе и возвращает NextResponse.json если что-то идет не так
 */
export async function authorizeAccess(req: Request) {
	// @ts-ignore
	const access = req.headers['access']
	if(!access) throw new Error('403',{cause: 'No access token provided'})
	// console.log(access)
	
	const data = await signIn(access)
	if(!data) throw new Error('401', {cause: 'Invalid token'})
	// console.log(data)
	
	return data!
}
