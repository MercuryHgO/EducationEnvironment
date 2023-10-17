const sha256 = require('js-sha256')
const PrismaClient = require('.prisma/client')

const prisma = new PrismaClient.PrismaClient();


console.log('start seeding')

async function main() {
	// users
	const dummyUser = await prisma.user.upsert(
		{
			where: {
				name: 'boba'
			},
			create: {
				name: 'boba',
				password: sha256('aboba')
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