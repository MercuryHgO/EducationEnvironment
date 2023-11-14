/**
 * @jest-environment node
 */
import {sign} from "jsonwebtoken";
import * as studentEndpoints from '../../../app/api/students/route'
import keys from "../../../lib/dotenv";
import {prisma} from "@/lib/prisma"
import {roles} from "@/lib/config";

const getAccessKey = async ()=> {
	const User= await prisma.user.findUnique({
		where: {
			name: "boba"
		}
	})
	const {id} = User!

	return sign({id: id}, keys.JWT_ACCESS_KEY,{expiresIn: 60})
}

describe('Api endpoint /api/students', () => {
	describe('GET', () => {
		
		
		test('Must return single JSON of {id,name,surname,groupCode}', async () => {
			
			const req1: Request = new Request('https://choto.com/students?id=cuid1',{
				method: 'GET',
				headers: {
					Access: await getAccessKey()
				},
			})
			
			const res = await studentEndpoints.GET(req1)
			expect(res?.status).not.toBe(500)
			
			const data = await res?.json();
			
			expect(data).toHaveProperty(['id'])
			expect(data).toHaveProperty(['name'])
			expect(data).toHaveProperty(['surname'])
			expect(data).toHaveProperty(['groupCode'])
		})
		
		test('Must return an array of {id,name,surname,groupCode}[]', async () => {
			const req2: Request = new Request('http://chtoto.com/students?name=Михаил',{
				method: 'GET',
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.GET(req2)
			expect(res?.status).not.toBe(500)
			
			const data = await res?.json()
			
			expect(Array.isArray(data)).toBe(true)
			expect(data![0]).toHaveProperty(['id'])
			expect(data![0]).toHaveProperty(['name'])
			expect(data![0]).toHaveProperty(['surname'])
			expect(data![0]).toHaveProperty(['groupCode'])
		})
	})
	
	describe('POST',() => {
		test('Must make a valid post request', async () => {
			const mock = new Request('https://chtoto.com', {
				method: 'POST',
				body: JSON.stringify([{
					name: 'Василий',
					surname: 'Семенов',
					groupCode: '37/1_Пр'
				}]),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.POST(mock);
			expect(res?.status).not.toBe(500);
			expect(res?.status).toBe(200);
			
			const resData = await res.json();
			expect(resData).toHaveProperty('count',1)
			
			const databaseData = await prisma.student.findMany({
				where: {
					name: 'Василий',
					surname: 'Семенов',
					groupCode: '37/1_Пр'
				}
			})
			
			expect(databaseData[0]).toHaveProperty('id')
			expect(databaseData[0]).toHaveProperty('name','Василий')
			expect(databaseData[0]).toHaveProperty('surname','Семенов')
			expect(databaseData[0]).toHaveProperty('groupCode','37/1_Пр')
		})
		
		test('Must throw an error', async () => {
			const mock = new Request('https://chtoto.com', {
				method: 'POST',
				body: JSON.stringify([{
					name: 'Василий',
					// surname: 'Семенов',
					groupCode: '37/1_Пр'
				}]),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.POST(mock)
			expect(res?.status).not.toBe(500)
			expect(res?.status).not.toBe(200)
		})
	})
	
	describe('PATCH', () => {
		test('Must make a valid POST request',async () => {
			const mock = new Request('https://chtoto.com', {
				method: 'PATCH',
				body: JSON.stringify({
					id: 'cuid1',
					name: 'Михаил',
					surname: 'Стеблянский',
					patronymic: 'Владиславович',
					groupCode: '37/1_Пр'
				}),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.PATCH(mock);
			expect(res?.status).not.toBe(500)
			
			const data = await res.json();
			
			expect(data).toHaveProperty('id', 'cuid1')
			expect(data).toHaveProperty('name', 'Михаил')
			expect(data).toHaveProperty('surname', 'Стеблянский')
			expect(data).toHaveProperty('patronymic', 'Владиславович')
			expect(data).toHaveProperty('groupCode', '37/1_Пр')
			
		})
		
		test('Must throw an error', async () => {
			const mock = new Request('https://chtoto.com', {
				method: 'PATCH',
				body: JSON.stringify({
					id: 'cuid1',
					name: 'Михаил',
					patronymic: 'Владиславович',
					groupCode: '37/1_Пр'
				}),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.PATCH(mock);
			expect(res).not.toBe(500)
			expect(res).not.toBe(200)
		})
	})
	
	describe('DELETE',() => {
		test('Must make a valid DELETE request', async () => {
			const mock = new Request('http://chtoto.com',{
				method: 'DELETE',
				body: JSON.stringify([{
					id: 'cuid1'
				}]),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.DELETE(mock)
			expect(res?.status).not.toBe(500)
			
			const data = await res.json()
			
			expect(data).toHaveProperty('count',1)
		})
		
		test('Must return an error',async () => {
			const mock = new Request('http://chtoto.com',{
				method: 'DELETE',
				body: JSON.stringify({
					id: 'cuid2'
				}),
				headers: {
					Access: await getAccessKey()
				}
			})
			
			const res = await studentEndpoints.DELETE(mock)
			expect(res?.status).not.toBe(500)
			expect(res?.status).not.toBe(200)
		})
	})
	
	
	describe('Authorization checks',() => {
		test('No token',async () => {
			const mock = new Request('http://chtoto.com',{
			})
			
			expect((await studentEndpoints.GET(mock))?.status).toBe(401)
			expect((await studentEndpoints.POST(mock))?.status).toBe(401)
			expect((await studentEndpoints.PATCH(mock))?.status).toBe(401)
			expect((await studentEndpoints.DELETE(mock))?.status).toBe(401)
		})
		
		test('Wrong token', async () => {
			const mock = new Request('http://chtoto.com',{
				headers: {
					Access: 'Gimme da access'
				}
			})
			
			expect((await studentEndpoints.GET(mock))?.status).toBe(401)
			expect((await studentEndpoints.POST(mock))?.status).toBe(401)
			expect((await studentEndpoints.PATCH(mock))?.status).toBe(401)
			expect((await studentEndpoints.DELETE(mock))?.status).toBe(401)
		})
		
		test('Logged in but has no access', async () => {
			
			const User = await prisma.user.findUnique({
				where: {
					name: 'che'
				}
			})
			
			const token = sign({id: User?.id},keys.JWT_ACCESS_KEY!, {expiresIn: 60})
			
			const mock = new Request('http://chtoto.com',{
				headers: {
					Access: token
				}
			})
			
			
			expect((await studentEndpoints.GET(mock))?.status).toBe(
				roles.students?.GET ? 403 : 400
			)
			expect((await studentEndpoints.POST(mock))?.status).toBe(
				roles.students?.POST ? 403 : 400
			)
			expect((await studentEndpoints.PATCH(mock))?.status).toBe(
				roles.students?.PATCH ? 403 : 400
			)
			expect((await studentEndpoints.DELETE(mock))?.status).toBe(
				roles.students?.DELETE ? 403 : 400
			)
			
		})
	})
})