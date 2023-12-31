import {NextResponse} from "next/server";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {signUp} from "@/lib/auth";
import handleErrorToHTTP from "@/lib/errorHandler";

// TODO: Обработка ошибок
export async function POST(req: Request) {
	try {
		const {name, password} = await req.json();
		
		try {
			const query = await signUp(name, password)
			
			return NextResponse.json(query)
		} catch (e) {
			if (e instanceof PrismaClientKnownRequestError) {
				switch (e.code) {
					default:
						return NextResponse.json('Server error', {status: 500})
				}
			}
			
			console.log(e)
			return NextResponse.json('Server error', {status: 500})
		}
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
