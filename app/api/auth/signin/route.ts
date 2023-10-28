import {generateTokens, updateTokens} from "@/lib/auth";
import {NextResponse} from "next/server";

export async function GET(req: Request) {
	const url = (req.url).split('?');
	
	const query = Object.fromEntries(
		url[1].split('&').map(
			(val) => val.split('=')
		)
	)
	
	const {name, password, refresh} = query
	
	if(refresh){
		const updatedTokens = await updateTokens(refresh)
		if(!updatedTokens){
			return NextResponse.json('Invalid refresh token',{status: 401})
		}
		
		return NextResponse.json(updatedTokens)
	}
	
	if(name && password) {
		const tokens = await generateTokens(name,password)
		if(!tokens) return NextResponse.json('Authentication error',{status: 401})
		
		return NextResponse.json(tokens)
	}
	
	return NextResponse.json('Not valid data',{status: 400})
}