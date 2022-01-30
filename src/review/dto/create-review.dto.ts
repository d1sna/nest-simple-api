import { IsString, IsNumber, Max, Min } from 'class-validator';
import { LARGE_RATING, LOW_RATING } from '../review.constants';
export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @Max(5, { message: LARGE_RATING })
  @Min(1, { message: LOW_RATING })
  @IsNumber()
  rating: number;

  @IsString()
  productId: string;
}
