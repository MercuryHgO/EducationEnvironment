import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import {NextResponse} from "next/server";

/**
 * Handles error and coverts them to the NextResponse() HTTP errors
 *
 * Обрабатывает ошибки и преобразует их в методы NextResponse() с HTTP ошибками
 * #
 * ### Error list / Список ошибок:
 *
 * P2003 - 400
 *
 * P2025 - 404
 *
 * PrismaClientValidationError - 400
 *
 * WRONG_TOKEN - 403
 *
 * NO_TOKEN - 401
 */
const handleErrorToHTTP = (e: any) => {
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
	// console.log(e)
	switch (e.name) {
		case 'PrismaClientValidationError':
			return NextResponse.json('Your request does not contain required fields', {status: 400})
		default:
			switch (e.message) {
				case 'NO_TOKEN':
					return NextResponse.json(e.cause, {status: 401})
				case 'WRONG_TOKEN':
					return NextResponse.json(e.cause, {status: 403})
				default:
					return NextResponse.json('Server error', {status: 500})
			}
	}
}

export default handleErrorToHTTP