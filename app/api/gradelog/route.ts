import handleErrorToHTTP from "@/lib/errorHandler";
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import GradeLogCreateManyArgs = Prisma.GradeLogCreateManyArgs;
import GradeLogWhereInput = Prisma.GradeLogWhereInput;
import GradeLogDeleteManyArgs = Prisma.GradeLogDeleteManyArgs;

// TODO: документация
export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.gradeLog?.GET)
		
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
			studentName,
			studentSurname,
			studentPatronymic,
			studentId,
			group,
			subject
		} = query
		
		const timeStamp = startDate && endDate ? {gte: new Date(startDate), lte: new Date(endDate)} : null
		
		if(id) {
			const request = await prisma.gradeLog.findUnique({
				where: {
					id: id
				}
			})
			
			if(!request) return NextResponse.json('No gradeLog entry found',{status: 404})
			
			return NextResponse.json(request)
		}
		
		const request = await prisma.gradeLog.findMany({
			where: {
				OR: [
					{
						date: timeStamp!
					},
					{
						Subject: subject
					},
					{
						Student: {
							id: studentId,
						}
					},
					{
						Student: {
							name: studentName
						}
					},
					{
						Student: {
							surname: studentSurname
						}
					},
					{
						Student: {
							patronymic: studentPatronymic
						}
					},
					{
						Student: {
							groupCode: group
						}
					}
				]
			}
		})
		
		if(!request[0]) return NextResponse.json('No gradeLog entry found',{status: 404})
		
		return NextResponse.json(request)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}

export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.gradeLog?.POST)
		
		const data: GradeLogCreateManyArgs = await req.json()
		
		const query = await prisma.gradeLog.createMany(data)
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}

export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.gradeLog?.PATCH)
		
		const data = await req.json()
		
		const {
			id,
			date,
			studentId,
			subject,
			grade
		} = data
		
		const query = await prisma.gradeLog.update({
			where: {
				id: id
			},
			data: {
				date: date,
				grade: grade,
				Student: {
					connect: {
						id: studentId
					}
				},
				Subject: {
					connect: {
						name: subject
					}
				}
			}
		})
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}

export async function DELETE(req: Request) {
	try {
		await authorizeAccess(req,roles?.gradeLog?.DELETE)
		
		const data = await req.json()
		
		const deleteArgs: GradeLogDeleteManyArgs = data.map(
			(id: string): GradeLogWhereInput => ({id: id})
		)
		
		const query = await prisma.gradeLog.deleteMany(deleteArgs)
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
