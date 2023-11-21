import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma"
import handleErrorToHTTP from "@/lib/errorHandler";
import {Prisma} from ".prisma/client";
import ScheduleCreateManyInput = Prisma.ScheduleCreateManyInput;
import ScheduleDeleteManyArgs = Prisma.ScheduleDeleteManyArgs;
import ScheduleWhereInput = Prisma.ScheduleWhereInput;

export async function GET(req: Request) {
	try {
		await authorizeAccess(req, roles?.schedule?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const {
			id,
			startDate,
			endDate,
			subjectId,
			teacherId,
			groupCode,
			cabinet
		} = query
		
		if (id) {
			const request = await prisma.schedule.findUnique({
				where: {
					id: id
				}
			})
			
			if (!request) return NextResponse.json('No schedule entry found', {status: 404})
			
			return NextResponse.json(request)
		}
		
		const request = await prisma.schedule.findMany({
			where: {
				OR: [
					{
						date: {
							lte: endDate,
							gte: startDate,
						}
					},
					{
						subjectId: subjectId,
					},
					{
						teacherId: teacherId,
					},
					{
						groupCode: groupCode,
					},
					{
						cabinet: Number(cabinet)
					}
				]
			}
		})
		
		if (!request[0]) return NextResponse.json('No gradeLog entry found', {status: 404})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
}
export async function POST(req: Request) {
	try {
		await authorizeAccess(req, roles?.schedule?.POST)
		
		const data: ScheduleCreateManyInput[] = await req.json();
		
		const request = await prisma.schedule.createMany({
			data: data
		})
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
	
}
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req, roles?.schedule?.PATCH)
		
		const data: {
			id: string,
		} & Required<ScheduleCreateManyInput> = await req.json()
		
		const request = await prisma.schedule.update({
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
		await authorizeAccess(req, roles?.schedule?.DELETE)
		
		const data = await req.json();
		
		const deleteArgs: ScheduleDeleteManyArgs = data.map(
			(id: string): ScheduleWhereInput => ({id: id})
		)
		
		const request = await prisma.schedule.deleteMany(deleteArgs)
		
		return NextResponse.json(request)
	} catch (e) {
		handleErrorToHTTP(e)
	}
	
}
