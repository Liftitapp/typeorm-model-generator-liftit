import { camelCase } from "change-case";

import { AbstractNamingStrategy } from "./AbstractNamingStrategy";
import { DatabaseModel } from "./models/DatabaseModel";
import { RelationInfo } from "./models/RelationInfo";

export class NamingStrategy extends AbstractNamingStrategy {
    public relationName(
        columnOldName: string,
        relation: RelationInfo,
        dbModel: DatabaseModel
    ): string {
        const isRelationToMany = relation.isOneToMany || relation.isManyToMany;
        const ownerEntity = dbModel.entities.find(
            v => v.EntityName === relation.ownerTable
        )!;

        let columnName =
            columnOldName[0].toLowerCase() +
            columnOldName.substring(1, columnOldName.length);

        if (
            columnName.toLowerCase().endsWith("id") &&
            !columnName.toLowerCase().endsWith("guid")
        ) {
            columnName = camelCase(
                columnName.substring(
                    0,
                    columnName.toLowerCase().lastIndexOf("id")
                )
            );
        }

        if (!isNaN(parseInt(columnName[columnName.length - 1], 10))) {
            columnName = columnName.substring(0, columnName.length - 1);
        }
        if (!isNaN(parseInt(columnName[columnName.length - 1], 10))) {
            columnName = columnName.substring(0, columnName.length - 1);
        }
        columnName += isRelationToMany ? "s" : "";

        if (
            relation.relationType !== "ManyToMany" &&
            columnOldName !== columnName
        ) {
            if (ownerEntity.Columns.some(v => v.tsName === columnName)) {
                columnName = columnName + "_";
                for (let i = 2; i <= ownerEntity.Columns.length; i++) {
                    columnName =
                        columnName.substring(
                            0,
                            columnName.length - i.toString().length
                        ) + i.toString();
                    if (
                        ownerEntity.Columns.every(
                            v =>
                                v.tsName !== columnName ||
                                columnName === columnOldName
                        )
                    ) {
                        break;
                    }
                }
            }
        }

        return camelCase(columnName);
    }

    public entityName(entityName: string): string {
        return entityName;
    }

    public columnName(columnName: string): string {
        return camelCase(columnName);
    }
}
