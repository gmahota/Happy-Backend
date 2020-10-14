run:
	##Criação de migracoes
	yarn typeorm migration:create -n create_orphanages
	yarn typeorm migration:create -n create_images
	yarn typeorm migration:run 

	## Anular a migração
	yarn typeorm migration:revert