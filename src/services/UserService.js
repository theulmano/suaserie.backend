const database = require('../models')
const { where } = require('sequelize')
const {compare} = require('bcryptjs')
const {hash} = require('bcryptjs');
const UUID = require('uuid');
class UserService{
    async create(userDTO){
        try {
            const user = await database.user.findOne({
                where: {
                    email: userDTO.email
                }});
            
            if(user){
                throw new Error("Email já cadastrado no sistema!");    
            }

            const role  = await getRole(); 
            
            const passwordHash = await hash(userDTO.password, 8);
            const newUser  = await database.user.create({
                id: UUID.v4(),
                name: userDTO.name,
                nickname: userDTO.nickname,
                lastname: userDTO.lastname,
                email: userDTO.email,
                password: passwordHash,
                roleId: role.id
            })
        
            return newUser;
            
            
        } catch (error) {
            throw new Error("Erro ao tentar cadastrar usuário. " + error.message);

        }
    }

    async getAll(){
        try {
            const users = await database.user.findAll();
            
            if(!users){
                throw new Error("Não há usuários cadastrados!");
            }

            return users;

        } catch (error) {
            throw new Error("Erro ao buscar usuários: " + error.message);
        }


    }

    async getById(id){

        const user = await database.user.findByPk(id);
        
        if(!user){
            throw new Error(`Usuário com id ${id} não encontrado!`);
        }
        
        return user;     
    }

    async deleteById(id){
        const user = await this.getById(id);
        try {
            await user.destroy();
        } catch (error) {
            throw new Error("Erro ao tentar deletar usuário: ");
        }
        return user;
    }

    async update(id, updateFields){ 
        const user = await this.getById(id);
        try {            

            Object.assign(user, updateFields)
            const updatedUser = await user.save();

            return updatedUser;
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao tentar atualizar o usuário!");
        }
    }
    
    async changePassword(dto){
        const user = await database.user.findByPk(dto.userId,{
            attributes: {include: ['password']}
        });

        try {
            const samePasswords = await compare(dto.oldPassword, user.password)
            if(!samePasswords){
                throw new Error("Senha atual incorreta!");
            }

            const newPasswordHash = await hash(dto.newPassword, 8);
        
            user.password = newPasswordHash;
            await user.save();
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async addFavoriteSerie(dto){
        try {
          const serie = await database.serie.findOne({
              where:{
                  id: dto.idSerie
              }
          })  
          
          if(!serie){
            throw new Error("Série não encontrada no banco de dados!");
          }
          
          await database.user_serie_favorites.create({
            userId: dto.userId,
            serieId: dto.idSerie
          })
          const favorites = await database.user.findByPk(dto.userId, {
             include:{
                 association: 'favoritesList',
                 through: { 
                     attributes: [],
                   },
             } 
           });
 
 
           return favorites
         
        } catch (error) {
             console.log(error)
             throw new Error("Erro ao tentar adicionar série na lista: "+error)
        }
 
        
     }

     async removeFavoriteSerie(dto){
        try {
            console.log('teste');
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  
            
            console.log('teste2')
            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
            }

            await database.user_serie_favorites.destroy({ 
                where:{
                    userId: dto.userId,
                    serieId: dto.id
                }
                
            })
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao tentar remove série da lista de favoritos: "+error);
        }
     }

     async getFavoriteSeries(userId){
        const user = await database.user.findByPk(userId, {
            include:{
                association: 'favoritesList',
                through: { 
                    attributes: [],
                  },
            } 
          });
          

          if(!user){
            console.log(error)
            throw new Error("Usuário não cadastrado!")
          }

          return user.favoritesList
     }

     async addWatchedSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  

            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
              }

            await database.user_serie_watched.create({
                userId: dto.userId,
                serieId: dto.id
            })

            const watchedList = await database.user.findByPk(dto.userId, {
                include:{
                    association: 'watchedList',
                    through: { 
                        attributes: [],
                      },
                } 
              });

              return watchedList;

        } catch (error) {
            throw new Error("Não foi possivel adicionar essa série a lista "+ error);
        }
     }


     async removeWatchedSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  
            
            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
            }

            await database.user_serie_watched.destroy({ 
                where:{
                    userId: dto.userId,
                    serieId: dto.id
                }
                
            })
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao tentar remover série da lista de assistidas: "+error);
        }
     }

     async getWatchedSeries(userId){
        const user = await database.user.findByPk(userId, {
            include:{
                association: 'watchedList',
                through: { 
                    attributes: [],
                  },
            } 
          });
          

          if(!user){
            console.log(error)
            throw new Error("Usuário não cadastrado!")
          }

          return user.watchedList;
     }

     async addDislikedSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  

            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
              }

            await database.user_serie_disliked.create({
                userId: dto.userId,
                serieId: dto.id
            })

            const dislikedList = await database.user.findByPk(dto.userId, {
                include:{
                    association: 'dislikedList',
                    through: { 
                        attributes: [],
                      },
                } 
              });



              return dislikedList;

        } catch (error) {
            throw new Error("Não foi possivel adicionar essa série a lista "+ error);
        }
     }

     async removeDislikedSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  
            
            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
            }

            await database.user_serie_disliked.destroy({ 
                where:{
                    userId: dto.userId,
                    serieId: dto.id
                }
                
            })
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao tentar remover série da lista de dislike: "+error);
        }
     }


     async getDislikedSeries(userId){
        const user = await database.user.findByPk(userId, {
            include:{
                association: 'dislikedList',
                through: { 
                    attributes: [],
                  },
            } 
          });
          

          if(!user){
            console.log(error)
            throw new Error("Usuário não cadastrado!")
          }

          return user.dislikedList;
     }

     async addDesiredSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  

            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
              }

            await database.user_serie_desired.create({
                userId: dto.userId,
                serieId: dto.id
            })

            const desiredList = await database.user.findByPk(dto.userId, {
                include:{
                    association: 'desiredList',
                    through: { 
                        attributes: [],
                      },
                } 
              });



              return desiredList;

        } catch (error) {
            throw new Error("Não foi possivel adicionar essa série a lista "+ error);
        }
     }


     async removeDesiredSerie(dto){
        try {
            const serie = await database.serie.findOne({
                where:{
                    id: dto.id
                }
            })  
            
            if(!serie){
                throw new Error("Série não encontrada no banco de dados!");
            }

            await database.user_serie_desired.destroy({ 
                where:{
                    userId: dto.userId,
                    serieId: dto.id
                }
                
            })
        } catch (error) {
            console.log(error)
            throw new Error("Erro ao tentar remover série da lista de dislike: "+error);
        }
     }

     async getDesiredSeries(userId){
        const user = await database.user.findByPk(userId, {
            include:{
                association: 'desiredList',
                through: { 
                    attributes: [],
                  },
            } 
          });
          

          if(!user){
            console.log(error)
            throw new Error("Usuário não cadastrado!")
          }

          return user.desiredList;
     }

}

async function getRole(){
    let role = await database.roles.findOne({
        where:{
            name: 'user'
        }
    })

    if(!role){
        role = await database.roles.create({
            id: UUID.v4(),
            name: 'user',
            description: 'perfil de usuário'
        })
    }
    return role;
}

module.exports = UserService;