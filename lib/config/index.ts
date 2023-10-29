import * as config from '@/config.json'

export const roles: {
	students?: {
		GET?: string[],
		POST?: string[],
		PATCH?: string[],
		DELETE?: string[],
	},
	teachers?: {
		GET?: string[],
		POST?: string[],
		PATCH?: string[],
		DELETE?: string[],
	}
} = config.roles

