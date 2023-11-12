/**
 * @jest-environment node
 */
import {sign} from "jsonwebtoken";
import * as studentEndpoints from '../../../app/api/students/route'
import keys from "../../../lib/dotenv";
import {prisma} from "@/lib/prisma"

const getAccessKey = async ()=> {
	const User= await prisma.user.findUnique({
		where: {
			name: "boba"
		}
	})
	const {id} = User!

	return sign({id: id}, keys.JWT_ACCESS_KEY)
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
		
		// TODO: authorization tests
		test('Must return error 401 correctly', async () => {
			const req1: Request = new Request('https://choto.com/students?id=cuid1',{
				method: 'GET',
				headers: {
					// Access: await getAccessKey()
				},
			})
			
			const res = await studentEndpoints.GET(req1)
			expect(res?.status).not.toBe(500)
			
			expect(res?.status).toBe(401)
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
	})
})