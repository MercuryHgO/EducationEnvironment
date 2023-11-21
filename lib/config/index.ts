import * as config from '@/config.json'

type HTTPShortcut = {
	GET?: string[],
	POST?: string[],
	PATCH?: string[],
	DELETE?: string[],
}

export const roles: {
	students?: HTTPShortcut,
	teachers?: HTTPShortcut,
	gradeLog?: HTTPShortcut,
	schedule?: HTTPShortcut,
	groups?: HTTPShortcut,
	rolesEndpoint?: HTTPShortcut,
	subjects?: HTTPShortcut,
} = config.roles

