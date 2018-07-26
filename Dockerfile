from node:8-alpine

ARG polymerCLIVersion=polymer-cli

RUN yarn global add $polymerCLIVersion

RUN apk --update --no-cache add git

USER node

CMD ["polymer"]
