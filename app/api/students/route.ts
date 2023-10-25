/** @file
 * # API endpoint /api/students
 * Provides access to the students data from database.
 * Every endpoint requires 'Access' header with Access token to authorize access to the data.
 *
 * Предоставляет доступ к информации о студентах из базы данных.
 * Каждая конечная точка требует заголовок 'Access' содержащий токен Access для получения доступа к данным.
 * #
 *
 * ## GET
 * ### Accept:
 * Query string contains **id** or information about student such as **name**, **surname**, **patronymic** or **groupCode**.
 * First it finds **id** in query: if presented, returns a student with this **id**, ignoring other provided information.
 * If **id** not represented, it returns the student for the rest of the provided data, including all provided fields in the search:
 * it can be **?name=[name]**, **?name=[name]&surname=[surname]**, **?patronymic=[patronimyc]&groupCode=[group code]** and so on.
 * #
 *
 * ### Принимает:
 * Строку поиска содержащую **id** или информацию о студенте, такую как **name**, **surname**, **patronymic** or **groupCode** (имя, фамилия, отчество, код группы).
 * Первым делом сервер ищет **id** в запросе: если таковой предоставлен, возвращает студента по его **id**, игнорируя другую предоставленную информацию.
 * Если **id** не представлен,  возвращает студента по остальным предоставленным данным, включая в поиск все предоставленные поля:
 * Это может выглядить как **"?name=[имя]"**, **"?name=[имя]&surname=[фамилия]"**, **"?patronymic=[отчество]&groupCode=[код группы]"** и т.п.
 * #
 *
 * ### Returns / Возвращает:
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
 * ## POST
 * Creates new student in the database /
 * Создает нового студента в базе данных
 * #
 *
 * ### Accept / Принимает:
 *
 * JSON object array / Массив JSON объектов
 *
 * **{ name, surname, patronymic?, groupCode }[]**
 * #
 *
 * ## PATCH
 * Updates information of student with **id** /
 * Обновляет информацию о студенте с **id**
 * #
 *
 * ### Accept / Принимает
 *
 * JSON object / JSON объект
 *
 * **{ id, name, surname, patronymic?, groupCode }**
 * #
 *
 * ## DELETE
 *
 * Deletes a student /
 * Удаляет студента
 * #
 *
 * ### Accept / Принимает
 *
 * All the given JSON fields: **minimum 1 field necessary** / Все предоставленные поля из JSON объекта: **необходимо хотя бы одно поле**
 *
 * **{ id?, name?, surname?, patronymic?, groupCode? }**
 */

import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {Prisma} from ".prisma/client";
import StudentCreateManyInput = Prisma.StudentCreateManyInput;
import StudentScalarWhereInput = Prisma.StudentScalarWhereInput;
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {Student} from "@prisma/client";

export async function GET(req: Request): Promise<NextResponse<Student | Student[] | string> | undefined> {
	try {
		const authorizationData = await authorizeAccess(req)
		
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
		
		if (name || surname || patronymic || groupCode) {
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
		}
	} catch (e: any) {
		switch (e.message) {
			case '403' || '401':
				return NextResponse.json(e.cause,{status: Number(e.message)})
			default:
				return NextResponse.json('Server error', {status: 500})
		}
	}
}

export async function POST(req: Request) {
	
	try {
		const authorizationData = await authorizeAccess(req)
		
		const data: StudentCreateManyInput[] = await req.json()
		const query = await prisma.student.createMany({
			data: data
		})

		return NextResponse.json(query)
	} catch (e: any) {
		if(e instanceof PrismaClientKnownRequestError) {
			console.log(e)
			console.log(e.code)
			switch (e.code) {
				case 'P2003':
					const {field_name} = e.meta!
					return NextResponse.json(`Wrong request body: ${field_name}`, {status: 400})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
		}
		switch (e.name) {
			case 'PrismaClientValidationError':
				return NextResponse.json('Your request does not contain required fields', {status: 400})
			default:
				switch (e.message) {
					case '403' || '401':
						return NextResponse.json(e.cause,{status: Number(e.message)})
					default:
						return NextResponse.json('Server error', {status: 500})
				}
		}
	}
}

export async function PATCH(req: Request) {
	
	try {
		const authorizationData = await authorizeAccess(req)
		
		// Костыль: тип для update возвращает какую-то херню, но если использовать ManyInput то резльтат тот же.
		const data: StudentCreateManyInput = await req.json()
		console.log(data)
		const query = await prisma.student.update({
			where: {
				id: data.id
			},
			data: {
				name: data.name,
				surname: data.surname,
				patronymic: data.patronymic,
				groupCode: data.groupCode
			}
		})
		
		return NextResponse.json(query)
	} catch (e: any) {
		if (e instanceof PrismaClientKnownRequestError) {
			console.log(e)
			console.log(e.code)
			switch (e.code) {
				case 'P2003':
					const {field_name} = e.meta!
					return NextResponse.json(`Wrong request body: ${field_name}`, {status: 400})
				case 'P2025':
					return NextResponse.json('Record not found', {status: 404})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
		}
		console.log(e)
		switch (e.name) {
			case 'PrismaClientValidationError':
				return NextResponse.json('Your request does not contain required fields', {status: 400})
			default:
				switch (e.message) {
					case '403' || '401':
						return NextResponse.json(e.cause, {status: Number(e.message)})
					default:
						return NextResponse.json('Server error', {status: 500})
				}
		}
	}
}

export async function DELETE(req: Request) {
	
	try {
		const authorizationData = await authorizeAccess(req)
		
		const data: StudentScalarWhereInput[] = await req.json()
		
		const query = await prisma.student.deleteMany({
			where: {
				OR: data
			}
		})
		
		return NextResponse.json(query)
	} catch (e: any) {
		if (e instanceof PrismaClientKnownRequestError) {
			console.log(e)
			console.log(e.code)
			switch (e.code) {
				case 'P2003':
					const {field_name} = e.meta!
					return NextResponse.json(`Wrong request body: ${field_name}`, {status: 400})
				case 'P2025':
					return NextResponse.json('Record not found', {status: 404})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
		}
		console.log(e)
		switch (e.name) {
			case 'PrismaClientValidationError':
				return NextResponse.json('Your request does not contain required fields', {status: 400})
			default:
				switch (e.message) {
					case '403' || '401':
						return NextResponse.json(e.cause, {status: Number(e.message)})
					default:
						return NextResponse.json('Server error', {status: 500})
				}
		}
	}
}