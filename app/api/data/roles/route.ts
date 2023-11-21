import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import handleErrorToHTTP from "@/lib/errorHandler";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import RoleDeleteManyArgs = Prisma.RoleDeleteManyArgs;
import RoleWhereInput = Prisma.RoleWhereInput;

export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.rolesEndpoint?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const { name, id } = query
		
		if(id) {
			const request = await prisma.role.findUnique({
				where: {
					id: id
				}
			})
			
			if(!request) return NextResponse.json('No role entry found',{status: 404})
			
			return NextResponse.json(request)
		}
		
		const request = await prisma.role.findUnique({
			where: {
				name: name
			}
		})
		
		if(!request) return NextResponse.json('No role entry found',{status: 404})
		
		return NextResponse.json(request)
		
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.rolesEndpoint?.POST)
		
		const data: {name: string}[] = await req.json()
		
		const request = prisma.role.createMany({
			data: data
		})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.rolesEndpoint?.PATCH)
		
		const data: {id: string, name: string} = await req.json()
		
		const request = await prisma.role.update({
			where: {
				id: data.id
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
		await authorizeAccess(req,roles?.rolesEndpoint?.DELETE)
		
		const data = await req.json()
		
		const deleteArgs: RoleDeleteManyArgs = data.map(
			(id: string): RoleWhereInput => ({ id: id })
		)
		
		const request = await prisma.role.deleteMany(deleteArgs)
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}