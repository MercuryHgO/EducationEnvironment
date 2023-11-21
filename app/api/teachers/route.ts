// TODO: Документация
/** @file
 * # API endpoint /api/teachers
 * Provides access to the teachers data from database.
 * Every endpoint requires 'Access' header with Access token to authorize access to the data.
 *
 * Предоставляет доступ к информации об учителях из базы данных.
 * Каждая конечная точка требует заголовок 'Access' содержащий токен Access для получения доступа к данным.
 * #
 *
 *
 */
import handleErrorToHTTP from "@/lib/errorHandler";
import {authorizeAccess} from "@/lib/auth/requestAuthorization";
import {roles} from "@/lib/config";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {Prisma} from ".prisma/client";
import TeacherCreateManyInput = Prisma.TeacherCreateManyInput;
import TeacherScalarWhereWithAggregatesInput = Prisma.TeacherScalarWhereWithAggregatesInput;

/**
 * @accept
 * Query string contains **id** or information about teacher such as **name**, **surname**, **patronymic** and other.
 * First it finds **id** in query: if presented, returns a teacher with this **id**, ignoring other provided information.
 * If **id** not represented, it returns the teacher for the rest of the provided data, including all provided fields in the search:
 * it can be **?name=[name]**, **?name=[name]&surname=[surname]**, and so on.
 *
 * /
 *
 * Строку поиска содержащую **id** или информацию об преподавателе, такую как **name**, **surname**, **patronymic**.
 * Первым делом сервер ищет **id** в запросе: если таковой предоставлен, возвращает преподавателя по его **id**, игнорируя другую предоставленную информацию.
 * Если **id** не представлен,  возвращает преподавателя по остальным предоставленным данным, включая в поиск все предоставленные поля:
 * Это может выглядеть как **"?name=[имя]"**, **"?name=[имя]&surname=[фамилия]"** и т.п.
 *
 * @returns
 * JSON object with teacher info if found by **id** / JSON объект с данными о преподавателе, если найден по **id**
 *
 * **{
 *  id,
 *  name,
 *  surname,
 *  patronymic?,
 *  category,
 *  education
 * }**
 *
 * Or array of the same objects if found by other fields / Или массив этого же объекта если найдено по другим полям
 *
 * **{
 *  id,
 *  name,
 *  surname,
 *  patronymic?,
 *  category,
 *  education
 * }[]**
 * #
 */
export async function GET(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.GET)
		
		const url = (req.url).split('?');
		
		const query = Object.fromEntries(
			url[1].split('&').map(
				(val) => val.split('=')
			)
		)
		
		const {id, name, surname, patronymic, category, education} = query
		
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
					{education: decodeURIComponent(education)},
					{category: decodeURIComponent(category)}
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

/**
 * @accept
 * JSON object array / Массив JSON объектов
 *
 * **{ name, surname, patronymic?, category, education }[]**
 * @returns
 * Amount of created entries / Кол-во созданных записей
 */
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
/**
 * @accept
 * JSON object / JSON объект
 *
 * **{ id, name, surname, patronymic?, category, education }**
 *
 * @returns
 * JSON object with modified data / JSON объект с обновленными данными
 *
 * **{ id, name, surname, patronymic?, category, education }**
 */
export async function PATCH(req: Request) {
	try {
		await authorizeAccess(req,roles?.teachers?.PATCH)
		
		const data: {
			id: string,
			name?: string,
			surname?: string,
			patronymic?: string,
			education?: string,
			category?: string
		} = await req.json()
		
		const query = await prisma.teacher.update({
			where: {
				id: data.id
			},
			data: data
		})
		
		return NextResponse.json(query)
	} catch (e) {
		return handleErrorToHTTP(e)
	}
}
/**
 * @accept
 * Array of teacher id's / Массив id преподавателей
 *
 * **{ id }[]**
 *
 * @returns
 * Count of deleted entries / Количество удаленных записей
 */
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
