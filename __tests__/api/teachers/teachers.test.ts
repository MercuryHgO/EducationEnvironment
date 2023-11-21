/**
 * @jest-environment node
 */
import {getAdminAccessKey, getUserAccessKey} from "@/lib/testingTokens";
import * as teachersEndpoints from "@/app/api/teachers/route"
import * as teacherEndpoints from "@/app/api/students/route";
import {roles} from "@/lib/config";

describe('Api endpoint /api/students', () => {
	describe('GET',() => {
		test('Must return a single JSON object', async () => {
			const mock = new Request('http://chtoto.com/api/teachers?id=teacherid1', {
				method: 'GET',
				headers: {
					Access: await getAdminAccessKey()
				}
			})
			
			const res = await teachersEndpoints.GET(mock);
			expect(res?.status).not.toBe(500)
			
			const data = await res.json()
			
			expect(data).toHaveProperty('id','teacherid1')
			expect(data).toHaveProperty('name','Наталия')
			expect(data).toHaveProperty('surname','Корманенко')
			expect(data).toHaveProperty('education','Образование')
			expect(data).toHaveProperty('category','Категория')
			
		})
		
		test('Must return a single JSON object', async () => {
			const mock = new Request('http://chtoto.com/api/teachers?name=Наталия&surname=Владимировна', {
				method: 'GET',
				headers: {
					Access: await getAdminAccessKey()
				}
			})
			
			const res = await teachersEndpoints.GET(mock);
			expect(res?.status).not.toBe(500)
			
			const data = await res.json()
			
			expect(Array.isArray(data)).toBe(true)
			
			expect(data[0]).toHaveProperty('id','teacherid1')
			expect(data[0]).toHaveProperty('name','Наталия')
			expect(data[0]).toHaveProperty('surname','Корманенко')
			expect(data[0]).toHaveProperty('education','Образование')
			expect(data[0]).toHaveProperty('category','Категория')
			
		})
	})
	
	describe('POST',() => {
		test('Must make a valid POST request',async () => {
			const mock = new Request('http://chtoto.com/api/teachers', {
				method: 'POST',
				headers: {
					Access: await getAdminAccessKey()
				},
				body: JSON.stringify([
					{
						name: 'Мария',
						surname: 'Нечитайло',
						education: 'Образование',
						category: 'Специальность'
					},
					{
						name: 'Петя',
						surname: 'Семечкин',
						education: 'Образование',
						category: 'Специальность'
					},
				])
			})
			
			const res = await teachersEndpoints.POST(mock)
			expect(res?.status).not.toBe(500)
			
			const data = await res.json();
			
			expect(data).toHaveProperty('count',2)
		})
		
		test('Must return an error',async () => {
			const mock = new Request('http://chtoto.com/api/teachers', {
				method: 'POST',
				headers: {
					Access: await getAdminAccessKey()
				},
				body: JSON.stringify(
					{
						name: 'Мария',
						// surname: 'Нечитайло',
						education: 'Образование',
						category: 'Специальность'
					},
				)
			})
			
			const res = await teachersEndpoints.POST(mock)
			expect(res?.status).toBeLessThan(500)
			expect(res?.status).toBeGreaterThan(200)
		})
	})
	
	describe('PATCH',() => {
		test('Must make a valid PATCH request', async () => {
			const mock = new Request('http://chtoto.com',{
				method: 'PATCH',
				headers: {
					Access: await getAdminAccessKey()
				},
				body: JSON.stringify({
					id: 'teacherid1',
					name: 'Наталия',
					surname: 'Корманенко',
					education: 'Некое образование',
					category: 'Некая категория'
				})
			})
			
			const res = await teachersEndpoints.PATCH(mock)
			expect(res?.status).not.toBe(500)
			
			const data = await res.json()
			
			expect(data).toHaveProperty('id','teacherid1')
			expect(data).toHaveProperty('name','Наталия')
			expect(data).toHaveProperty('surname','Корманенко')
			expect(data).toHaveProperty('education','Некое образование')
			expect(data).toHaveProperty('category','Некая категория')
		})
		
		test('Must return an error',async () => {
			const mock = new Request('http://chtoto.com',{
				method: 'PATCH',
				headers: {
					Access: await getAdminAccessKey()
				},
				body: JSON.stringify({
					// id: 'teacherid1',
					name: 'Наталия',
					surname: 'Корманенко',
					education: 'Некое образование',
					category: 'Некая категория'
				})
			})
			
			const res = await teachersEndpoints.PATCH(mock)
			expect(res?.status).toBeLessThan(500)
			expect(res?.status).toBeGreaterThan(200)
		})
	})
	
	describe('DELETE',() => {
		test('Must make a valid DELETE request',async () => {
			const mock = new Request('http://chtoto.com',{
				method: 'DELETE',
				headers: {
					Access: await getAdminAccessKey()
				},
				body: JSON.stringify([{id: 'teacherid1'}])
			})
			
			const res = await teachersEndpoints.DELETE(mock)
			expect(res).not.toBe(500)
			
			const data = await res.json()
			expect(data).toHaveProperty('count',1)
		})
	})
	
	describe('Authorization checks',() => {
		test('No token',async () => {
			const mock = new Request('http://chtoto.com',{
			})
			
			expect((await teacherEndpoints.GET(mock))?.status).toBe(401)
			expect((await teacherEndpoints.POST(mock))?.status).toBe(401)
			expect((await teacherEndpoints.PATCH(mock))?.status).toBe(401)
			expect((await teacherEndpoints.DELETE(mock))?.status).toBe(401)
		})
		
		test('Wrong token', async () => {
			const mock = new Request('http://chtoto.com',{
				headers: {
					Access: 'Gimme da access'
				}
			})
			
			expect((await teacherEndpoints.GET(mock))?.status).toBe(401)
			expect((await teacherEndpoints.POST(mock))?.status).toBe(401)
			expect((await teacherEndpoints.PATCH(mock))?.status).toBe(401)
			expect((await teacherEndpoints.DELETE(mock))?.status).toBe(401)
		})
		
		test('Logged in but has no access', async () => {
			
			const mock = new Request('http://chtoto.com',{
				headers: {
					Access: await getUserAccessKey()
				}
			})
			
			
			expect((await teacherEndpoints.GET(mock))?.status).toBe(
				roles.teachers?.GET ? 403 : 400
			)
			expect((await teacherEndpoints.POST(mock))?.status).toBe(
				roles.teachers?.POST ? 403 : 400
			)
			expect((await teacherEndpoints.PATCH(mock))?.status).toBe(
				roles.teachers?.PATCH ? 403 : 400
			)
			expect((await teacherEndpoints.DELETE(mock))?.status).toBe(
				roles.teachers?.DELETE ? 403 : 400
			)
			
		})
	})
})