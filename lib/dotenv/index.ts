import 'dotenv'
import {configDotenv} from "dotenv";
configDotenv()

const keysArray = [
	[ 'DATABASE_URL', process.env.DATABASE_URL! ],
	[ 'JWT_ACCESS_KEY', process.env.JWT_ACCESS_KEY! ],
	[ 'JWT_REFRESH_KEY',  process.env.JWT_REFRESH_KEY! ]
]


keysArray.forEach((obj) => {
	if(obj[1] === undefined)  throw new Error(obj[0]+' is not defined in .env')
})

const keys = Object.fromEntries(keysArray)

console.log(keys)

export default keys