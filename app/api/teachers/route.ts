// TODO: Документация
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
 * it can be **?name=[name]**, **?name=[name]&surname=[surname]**, **?patronymic=[patronymic]&groupCode=[group code]** and so on.
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
import handleErrorToHTTP from "@/lib/errorHandler";
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import TeacherCreateManyInput = Prisma.TeacherCreateManyInput;
import TeacherUpdateArgs = Prisma.TeacherUpdateArgs;
import TeacherScalarWhereWithAggregatesInput = Prisma.TeacherScalarWhereWithAggregatesInput;

export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const {id, name, surname, patronymic, education} = query
		
		if(id) {
			const teacher = await prisma.teacher.findUnique({
				where: {
					id: id
				}
			})
			
			if(!teacher) {
				return NextResponse.json('No teacher found',{status: 404})
			}
			
			return NextResponse.json(teacher)
		}
		
		const teachers = await prisma.teacher.findMany({
			where: {
				OR: [
					{name: decodeURIComponent(name)},
					{surname: decodeURIComponent(surname)},
					{patronymic: decodeURIComponent(patronymic)},
					{education: decodeURIComponent(education)}
				]
			}
		})
		
		if(!teachers[0]) {
			return NextResponse.json('No teachers found',{status: 404})
		}
		
		return NextResponse.json(teachers)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}

export async function POST(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.POST)
		
		const data: TeacherCreateManyInput[] = await req.json()
		
		const query = await prisma.teacher.createMany({
			data: data
		})
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.PATCH)
		
		const data: TeacherUpdateArgs = await req.json()
		
		const query = await prisma.teacher.update(data)
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
export async function DELETE(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.DELETE)
		
		const data: TeacherScalarWhereWithAggregatesInput[] = await req.json()
		
		const query = await prisma.teacher.deleteMany({
			where:{
				OR: data
			}
		})
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
