import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {Prisma} from ".prisma/client";
import StudentCreateManyInput = Prisma.StudentCreateManyInput;
import StudentScalarWhereInput = Prisma.StudentScalarWhereInput;
import {signIn} from "@/lib/auth/auth";

// TODO: написать документацию
// TODO: написать общую функцию для авторизации
export async function GET(req: Request) {
	
	const access = req.headers.get('Access')
	if(!access) return NextResponse.json('No access token provided',{status: 403})
	console.log(access)
	
	const data = await signIn(access)
	console.log(data)
	if(!data) return NextResponse.json('Invalid token', {status: 401})
	
	
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
	
	console.log(decodeURIComponent(groupCode))
	
	if(id){
		const student = await prisma.student.findFirst({
			where: {
				id: id
			}
		})
		
		if(!student){
			return NextResponse.json('No student found',{
				status: 404
			})
		}
		
		return NextResponse.json(student)
	}
	
	if(name || surname || patronymic || groupCode){
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
		
		if(!(student[0])){
			return NextResponse.json('No student found',{
				status: 404
			})
		}
		
		return NextResponse.json(student)
	}
}

export async function POST(req: Request) {
	
	const access = req.headers.get('Access')
	if(!access) return NextResponse.json('No access token provided',{status: 403})
	console.log(access)
	
	const data = await signIn(access)
	console.log(data)
	if(!data) return NextResponse.json('Invalid token', {status: 401})
	
	try {
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
				return NextResponse.json('Server error',{status:500})
		}
	}
}

export async function PATCH(req: Request){
	const access = req.headers.get('Access')
	if(!access) return NextResponse.json('No access token provided',{status: 403})
	console.log(access)
	
	const data = await signIn(access)
	console.log(data)
	if(!data) return NextResponse.json('Invalid token', {status: 401})
	
	try {
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
		if(e instanceof PrismaClientKnownRequestError) {
			console.log(e)
			console.log(e.code)
			switch (e.code) {
				case 'P2003':
					const {field_name} = e.meta!
					return NextResponse.json(`Wrong request body: ${field_name}`, {status: 400})
				case 'P2025':
					return NextResponse.json('Record not found',{status:404})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
		}
		console.log(e)
		switch (e.name) {
			case 'PrismaClientValidationError':
				return NextResponse.json('Your request does not contain required fields', {status: 400})
			default:
				return NextResponse.json('Server error',{status:500})
		}
	}
}

export async function DELETE(req: Request) {
	const access = req.headers.get('Access')
	if(!access) return NextResponse.json('No access token provided',{status: 403})
	console.log(access)
	
	const data = await signIn(access)
	console.log(data)
	if(!data) return NextResponse.json('Invalid token', {status: 401})
	
	try {
		const data: StudentScalarWhereInput[] = await req.json()
		
		const query = await prisma.student.deleteMany({
			where: {
				OR: data
			}
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
				case 'P2025':
					return NextResponse.json('Record not found',{status:404})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
		}
		console.log(e)
		switch (e.name) {
			case 'PrismaClientValidationError':
				return NextResponse.json('Your request does not contain required fields', {status: 400})
			default:
				return NextResponse.json('Server error',{status:500})
		}
	}
}