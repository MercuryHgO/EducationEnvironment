import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import handleErrorToHTTP from "@/lib/errorHandler";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import {roles} from "@/lib/config";
import SubjectDeleteManyArgs = Prisma.SubjectDeleteManyArgs;
import SubjectWhereInput = Prisma.SubjectWhereInput;

export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.subjects?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const { name, id } = query
		
		if(id) {
			const request = await prisma.subject.findUnique({
				where: {
					id: id
				}
			})
			
			if(!request) return NextResponse.json('No subject entry found',{status: 404})
			
			return NextResponse.json(request)
		}
		
		const request = await prisma.subject.findUnique({
			where: {
				name: name
			}
		})
		
		if(!request) return NextResponse.json('No subject entry found',{status: 404})
		
		return NextResponse.json(request)
		
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.subjects?.POST)
		
		const data: {name: string}[] = await req.json()
		
		const request = prisma.subject.createMany({
			data: data
		})
		
		return NextResponse.json(request)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.subjects?.PATCH)
		
		const data: {id: string, name: string} = await req.json()
		
		const request = await prisma.subject.update({
			where: {
				id: data.id
			},
			data: data
		})
		
		return NextResponse.json(request)
		
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
export async function DELETE(req: Request) {
	try {
		await authorizeAccess(req,roles?.subjects?.DELETE)
		
		const data = await req.json()
		
		const deleteArgs: SubjectDeleteManyArgs = data.map(
			(id: string): SubjectWhereInput => ({ id: id })
		)
		
		const request = await prisma.subject.deleteMany(deleteArgs)
		
		return NextResponse.json(request)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}