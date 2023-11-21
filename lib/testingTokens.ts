import {prisma} from "@/lib/prisma";
import {sign} from "jsonwebtoken";
import keys from "@/lib/dotenv";

export const getAdminAccessKey = async ()=> {
	const User= await prisma.user.findUnique({
		where: {
			name: "boba"
		}
	})
	
	return sign({id: User?.id}, keys.JWT_ACCESS_KEY,{expiresIn: 60})
}

export const getUserAccessKey = async () => {
	
	const User = await prisma.user.findUnique({
		where: {
			name: 'che'
		}
	})

	return sign({id: User?.id}, keys.JWT_ACCESS_KEY!, {expiresIn: 60})
}