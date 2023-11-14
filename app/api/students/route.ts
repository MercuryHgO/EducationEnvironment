/** @file
 * # API endpoint /api/students
 * Provides access to the students data from database.
 * Every endpoint requires 'Access' header with Access token to authorize access to the data.
 *
 * Предоставляет доступ к информации о студентах из базы данных.
 * Каждая конечная точка требует заголовок 'Access' содержащий токен Access для получения доступа к данным.
 */

import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from ".prisma/client";
import StudentCreateManyInput = Prisma.StudentCreateManyInput;
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {Student} from "@prisma/client";
import handleErrorToHTTP from "@/lib/errorHandler";
import {roles} from "@/lib/config";

/**
 * @accept
 * Query string contains **id** or information about student such as **name**, **surname**, **patronymic** or **groupCode**.
 * First it finds **id** in query: if presented, returns a student with this **id**, ignoring other provided information.
 * If **id** not represented, it returns the student for the rest of the provided data, including all provided fields in the search:
 * it can be **?name=[name]**, **?name=[name]&surname=[surname]**, **?patronymic=[patronymic]&groupCode=[group code]** and so on.
 *
 * /
 *
 * Строку поиска содержащую **id** или информацию о студенте, такую как **name**, **surname**, **patronymic** or **groupCode** (имя, фамилия, отчество, код группы).
 * Первым делом сервер ищет **id** в запросе: если таковой предоставлен, возвращает студента по его **id**, игнорируя другую предоставленную информацию.
 * Если **id** не представлен,  возвращает студента по остальным предоставленным данным, включая в поиск все предоставленные поля:
 * Это может выглядить как **"?name=[имя]"**, **"?name=[имя]&surname=[фамилия]"**, **"?patronymic=[отчество]&groupCode=[код группы]"** и т.п.
 *
 * @returns
 * JSON object with student info if found by **id** / JSON объект с данными о студенте, если найден по **id**
 *
 * **{
 *  id,
 *  name,
 *  surname,
 *  patronymic?,
 *  groupCode,
 * }**
 *
 * Or array of the same objects if found by other fields / Или массив этого же объекта если найдено по другим полям
 *
 * **{
 *  id,
 *  name,
 *  surname,
 *  patronymic?,
 *  groupCode,
 * }[]**
 * #
 *
 */
export async function GET(req: Request): Promise<NextResponse<Student | Student[] | string> | undefined> {
	try {
		await authorizeAccess(req,roles?.students?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const {
			id,
			name,
			surname,
			patronymic,
			groupCode
		} = query;
		
		// console.log(decodeURIComponent(groupCode))
		
		if (id) {
			const student = await prisma.student.findFirst({
				where: {
					id: id
				}
			})
			
			if (!student) {
				return NextResponse.json('No student found', {
					status: 404
				})
			}
			
			return NextResponse.json(student)
		}
		
		const student = await prisma.student.findMany({
			where: {
				OR: [
					{name: decodeURIComponent(name)},
					{surname: decodeURIComponent(surname)},
					{patronymic: decodeURIComponent(patronymic)},
					{groupCode: decodeURIComponent(groupCode)}
				]
			}
		})
		
		if (!(student[0])) {
			return NextResponse.json('No student found', {
				status: 404
			})
		}
		
		return NextResponse.json(student)
	} catch (e: any) {
		return handleErrorToHTTP(e)
	}
}

/**
 * Creates new student in the database /
 * Создает нового студента в базе данных
 *
 * @accept
 *
 * JSON object array / Массив JSON объектов
 *
 * **{ name, surname, patronymic?, groupCode }[]**
 *
 * @returns
 *
 * Count of created students / Кол-во созданных студентов
 */
export async function POST(req: Request) {
	
	try {
		await authorizeAccess(req,roles?.students?.POST)
		
		const data: StudentCreateManyInput[] = await req.json()
		const query = await prisma.student.createMany({
			data: data
		})

		return NextResponse.json(query)
	} catch (e: any) {
		return handleErrorToHTTP(e)
	}
}

/**
 * Updates information of student with **id** /
 * Обновляет информацию о студенте с **id**
 *
 * @accept
 * JSON object / JSON объект
 *
 * **{ id, name, surname, patronymic?, groupCode }**
 *
 * @returns
 * JSON object / JSON объект
 *
 * **{ id, name, surname, patronymic?, groupCode }**
 */
export async function PATCH(req: Request) {
	
	try {
		await authorizeAccess(req,roles?.students?.PATCH)
		
		const data: {
			id: string,
			name: string,
			surname: string,
			patronymic?: string,
			groupCode: string,
		} = await req.json()
		
		const query = await prisma.student.update({
			where: {
				id: data.id
			},
			data: data
		})
		
		return NextResponse.json(query)
	} catch (e: any) {
		return handleErrorToHTTP(e)
	}
}

/**
 * Deletes a student /
 * Удаляет студента
 * @accept
 * Array of student id / Массив из id студентов
 *
 * **{ id }[]**
 *
 * @returns
 * Count of deleted entries / Кол-во удаленных записей
 */
export async function DELETE(req: Request) {
	
	try {
		await authorizeAccess(req,roles?.students?.DELETE)
		
		const data: { id: string}[] = await req.json()
		
		const gradeLogData = data.map(value => ({studentId: value.id}))
		
		const queryStudent = prisma.student.deleteMany({
			where: {
				OR: data,
			},
		})
		
		const queryGradeLog = prisma.gradeLog.deleteMany({
			where: {
				OR: gradeLogData
			}
		})
		
		const query = await prisma.$transaction([queryGradeLog,queryStudent])
		
		
		return NextResponse.json(query[1])
	} catch (e: any) {
		return handleErrorToHTTP(e)
	}
}