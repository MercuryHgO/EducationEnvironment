import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import handleErrorToHTTP from "@/lib/errorHandler";
import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import GroupCreateManyInput = Prisma.GroupCreateManyInput;
import GroupDeleteManyArgs = Prisma.GroupDeleteManyArgs;
import GroupWhereInput = Prisma.GroupWhereInput;

export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.groups?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const {
			groupCode,
			specialization,
			teacherId
		} = query
		
		if(groupCode) {
			const request = await prisma.group.findUnique({
				where: {
					code: groupCode
				}
			})
			
			if(!request) return NextResponse.json('No groups entry found',{status: 404})
			
			return NextResponse.json(request)
		}
		
		const request = await prisma.group.findMany({
			where: {
				OR: [
					{
						specialization: specialization
					},
					{
						teacherId: teacherId
					}
				]
			}
		})
		
		
		if(!request[0]) return NextResponse.json('No groups entry found',{status: 404})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.groups?.POST)
		
		const data: GroupCreateManyInput[]  = await req.json()
		
		const request = await prisma.group.createMany({
			data: data
		})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.groups?.PATCH)
		
		const data: {groupCode: string} & GroupCreateManyInput = await req.json()
		
		const request = await prisma.group.update({
			where: {
				code: data.groupCode,
			},
			data: data
		})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function DELETE(req: Request) {
	try {
		await authorizeAccess(req,roles?.groups?.DELETE)
		
		const data = await req.json()
		
		const deleteArgs: GroupDeleteManyArgs = data.map(
			(code: string): GroupWhereInput => ({ code: code })
		)
		
		const request = await prisma.group.deleteMany(deleteArgs)
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
