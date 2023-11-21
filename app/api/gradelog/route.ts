import handleErrorToHTTP from "@/lib/errorHandler";
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import GradeLogWhereInput = Prisma.GradeLogWhereInput;
import GradeLogDeleteManyArgs = Prisma.GradeLogDeleteManyArgs;
import GradeLogCreateManyInput = Prisma.GradeLogCreateManyInput;

/**
 * @accept
 * Entry id or filters / Id записи или фильтры
 *
 * **{
 * 	id
 * }**
 *
 * or
 *
 * **{
 * 	startDate?,
 * 	endDate?,
 * 	studentName?,
 * 	studentSurname?,
 * 	studentPatronymic?,
 * 	studentId?,
 * 	group?,
 * 	subject?
 * }**
 *
 * When searching by data, both startDate and endDate required / При поиске по дате необходимы оба поля startDate и endDate
 *
 * @returns
 *
 * **{
 *  id: string,
 *  date: Date,
 *  studentId: string,
 *  subjectId: string,
 *  grade: number
 * }[]**
 */
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
						date: {
							lte: endDate,
							gte: startDate
						}
					},
					{
						subjectId: subject
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

/**
 * @accept
 * JSON object array / Массив JSON объектов
 *
 * **{
 *  date: Date | string,
 *  studentId: string,
 *  subjectId: string,
 *  grade: number
 * }[]**
 *
 * @returns
 * Count of created entries / Кол-во созданных записей
 *
 * **{ count: number }**
 */
export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.gradeLog?.POST)
		
		const data: GradeLogCreateManyInput[] = await req.json()
		
		const query = await prisma.gradeLog.createMany({
			data: data
		})
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}

/**
 * @accept
 * **{
 * 	id,
 * 	date,
 * 	studentId,
 * 	subject,
 * 	grade
 * }**
 *
 * @returns
 *
 * **{
 * id: string,
 * date: Date,
 * studentId: string,
 * subjectId: string,
 * grade: number
 * }**
 */
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

/**
 * @accept
 * **{id}[]**
 * @returns
 * Count of deleted entries / Кол-во удаленных записей
 */
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
