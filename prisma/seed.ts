const sha256 = require('js-sha256')
const PrismaClient = require('.prisma/client')

const prisma = new PrismaClient.PrismaClient();


console.log('start seeding')

async function main() {
	// roles
	
	const userRole = await prisma.role.upsert({
		where: {
			name: 'user'
		},
		update: {},
		create: {
			name: 'user'
		}
	})
	
	const adminRole = await prisma.role.upsert({
		where: {
			name: 'admin'
		},
		update: {},
		create: {
			name: 'admin'
		}
	})
	
	console.log(userRole,adminRole)
	
	// users
	const dummyUser = await prisma.user.upsert(
		{
			where: {
				name: 'boba'
			},
			create: {
				name: 'boba',
				password: sha256('aboba'),
				role: {
					connect: {
						name: 'admin'
					}
				}
			},
			update: {}
		}
	)
	
	console.log(dummyUser)
	
	
	// students
	const misha = await prisma.student.upsert({
		where: {
			id: 'cuid1',
		},
		update: {},
		create: {
			id: 'cuid1',
			name: 'Михаил',
			surname: 'Стеблянский',
			group: {
				connectOrCreate: {
					create: {
						code: '37/1_Пр',
						specialization: 'Программирование',
						curator: {
							connectOrCreate: {
								create: {
									id: 'teacherid1',
									name: 'Наталия',
									surname: 'Влдаимировна',
									category: 'Категория',
									education: 'Образование'
								},
								where: {
									id: 'teacherid1'
								}
							}
						}
					},
					where: {
						code: '37/1_Пр',
						specialization: 'Программирование'
					}
				}
			}
		}
	})
	
	const svyat = await prisma.student.upsert({
		where: {
			id: 'cuid2',
		},
		update: {},
		create: {
			id: 'cuid2',
			name: 'Святослав',
			surname: 'Кривокрысенко',
			group: {
				connectOrCreate: {
					create: {
						code: '37/1_Пр',
						specialization: 'Программирование',
						curator: {
							connectOrCreate: {
								create: {
									id: 'teacherid1',
									name: 'Наталия',
									surname: 'Влдаимировна',
									category: 'Категория',
									education: 'Образование'
								},
								where: {
									id: 'teacherid1'
								}
							}
						}
					},
					where: {
						code: '37/1_Пр',
						specialization: 'Программирование'
					}
				}
			}
		}
	})
	
	const nemisha = await prisma.student.upsert({
		where: {
			id: 'cuid3',
		},
		update: {},
		create: {
			id: 'cuid3',
			name: 'Михаил',
			surname: 'НеСтеблянский',
			group: {
				connectOrCreate: {
					create: {
						code: '37/1_Пр',
						specialization: 'Программирование',
						curator: {
							connectOrCreate: {
								create: {
									id: 'teacherid1',
									name: 'Наталия',
									surname: 'Влдаимировна',
									category: 'Категория',
									education: 'Образование'
								},
								where: {
									id: 'teacherid1'
								}
							}
						}
					},
					where: {
						code: '37/1_Пр',
						specialization: 'Программирование'
					}
				}
			}
		}
	})
	console.log(misha,svyat,nemisha)
	
	// gradeLog
	
	const createGradeLogRow = (subjectName: string, studentId: string, date: Date, grade: number) => {
		return {
			date: date,
			Subject: {
				connectOrCreate: {
					where: {
						name: subjectName
					},
					create: {
						name: subjectName
					}
				}
			},
			Student: {
				connect: {
					id: studentId
				}
			},
			grade: grade
		}
	}
	
	const grade1 = await prisma.gradeLog.upsert({
		where: {id: '1'},
		create: createGradeLogRow('math','cuid1',new Date('11.11.2023'),5),
		update: {}
	})
	
	const grade2 = await prisma.gradeLog.upsert({
		where: {id: '2'},
		create: createGradeLogRow('pe','cuid1',new Date('11.11.2023'),2),
		update: {}
	})
	
	const grade3 = await prisma.gradeLog.upsert({
		where: {id: '3'},
		create: createGradeLogRow('math','cuid2',new Date('11.11.2023'),3),
		update: {}
	})
	
	const grade4 = await prisma.gradeLog.upsert({
		where: {id: '4'},
		create: createGradeLogRow('pe','cuid2',new Date('11.11.2023'),4),
		update: {}
	})
	
	const grade5 = await prisma.gradeLog.upsert({
		where: {id: '5'},
		create: createGradeLogRow('pe','cuid1',new Date('11.12.2023'),-1),
		update: {}
	})
	
	const grade6 = await prisma.gradeLog.upsert({
		where: {id: '6'},
		create: createGradeLogRow('pe','cuid2',new Date('11.12.2023'),-1),
		update: {}
	})
	
	console.log('grades')
	console.log(grade1,grade2,grade3,grade4,grade5,grade6)
	
	// subjects
	
	// const english = prisma.subject.upsert({
	// 	where: {
	// 		name: 'english'
	// 	},
	// 	create: {
	// 		name: 'english'
	// 	},
	// 	update: {}
	// })
	//
	// const mdk = prisma.subject.upsert({
	// 	where: {
	// 		name: 'mdk'
	// 	},
	// 	create: {
	// 		name: 'mdk'
	// 	},
	// 	update: {}
	// })
	//
	// const pe = prisma.subject.upsert({
	// 	where: {
	// 		name: 'pe'
	// 	},
	// 	create: {
	// 		name: 'pe'
	// 	},
	// 	update: {}
	// })
}

main()

  .then(async () => {

    await prisma.$disconnect()

  })

  .catch(async (e) => {

    console.error(e)

    await prisma.$disconnect()

    process.exit(1)

  })