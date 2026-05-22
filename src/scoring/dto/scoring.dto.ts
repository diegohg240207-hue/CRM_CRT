import { IsNumber, IsEnum, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EvaluarScoringDto {
  @ApiProperty({ example: 720, description: 'Score de buró (300-850)' })
  @IsNumber() @Min(300) @Max(850)
  scoreBuro: number;

  @ApiProperty({ enum: ['PROPIA', 'FAMILIAR', 'RENTADA'] })
  @IsEnum(['PROPIA', 'FAMILIAR', 'RENTADA'])
  vivienda: string;

  @ApiProperty({ example: 18000, description: 'Salario mensual en MXN' })
  @IsNumber() @Min(0)
  salario: number;

  @ApiProperty({ example: 0.15, description: 'Ratio deuda/ingreso (0.10 = 10%)' })
  @IsNumber() @Min(0) @Max(1)
  capacidadPago: number;

  @ApiProperty({ example: 3, description: 'Años de antigüedad laboral' })
  @IsNumber() @Min(0)
  antiguedadLaboral: number;
}
