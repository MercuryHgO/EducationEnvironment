/**
 * @jest-environment node
 */
import {sign} from "jsonwebtoken";
import * as studentEndpoints from '../../../app/api/students/route'
import keys from "../../../lib/dotenv";
import {createRequest} from 'node-mocks-http'

// TODO: Создавать тестового пользователя
const testAccessKey = sign({ id: '23f9e63a-1ef5-4906-8096-0ef25a782591'},keys.JWT_ACCESS_KEY)

describe('Api endpoint /api/students', () => {
	describe('GET', () => {
		
		
		test('Must return single JSON of {id,name,surname,groupCode}', async () => {
			const req1 = createRequest({
				url: '?id=cuid1',
				method: 'GET',
				headers: {
					Access: testAccessKey
				}
			})
			
			const res = await studentEndpoints.GET(req1)
			const data = await res?.json();
			
			expect(data).toHaveProperty(['id'])
			expect(data).toHaveProperty(['name'])
			expect(data).toHaveProperty(['surname'])
			expect(data).toHaveProperty(['groupCode'])
		})
		
		test('Must return an array of {id,name,surname,groupCode}[]', async () => {
			const req2 = createRequest({
				url: '?name=Михаил',
				method: 'GET',
				headers: {
					Access: testAccessKey
				}
			})
			
			const res = await studentEndpoints.GET(req2)
			const data = await res?.json()
			
			expect(Array.isArray(data)).toBe(true)
			expect(data[0]).toHaveProperty(['id'])
			expect(data[0]).toHaveProperty(['name'])
			expect(data[0]).toHaveProperty(['surname'])
			expect(data[0]).toHaveProperty(['groupCode'])
		})
		
		test('Must return error 403 correctly', async () => {
			const req1 = createRequest({
				url: '?id=cuid1',
				method: 'GET',
				headers: {
					// Access: testAccessKey
				}
			})
			
			const res = await studentEndpoints.GET(req1)
			
			
			expect(res?.status).toBe(403)
		})
	})
})