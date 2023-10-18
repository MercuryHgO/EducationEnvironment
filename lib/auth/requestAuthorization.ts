import {NextResponse} from "next/server";
import {signIn} from "@/lib/auth/index";

/**
 * Authorizes user with Access token using request object - it finds Access header in the request and returns NextResponse.json object if something goes wrong
 *
 * Авторизирует пользователя с помощью Access токена используя объект Request - ищет заголовок Access в предоставленом запросе и возвращает NextResponse.json если что-то идет не так
 */
export async function authorizeAccess(req: Request) {
	const access = req.headers.get('Access')
	if(!access) return NextResponse.json('No access token provided',{status: 403})
	// console.log(access)
	
	const data = await signIn(access)
	// console.log(data)
	if(!data) return NextResponse.json('Invalid token', {status: 401})
	
	return data
}
